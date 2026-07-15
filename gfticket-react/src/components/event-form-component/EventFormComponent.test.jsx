import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventForm } from './EventFormComponent';
import { createEvent } from '../../services/eventService';

//Replace the whole service module with mocks: no HTTP happens, and every call can be inspected
vi.mock('../../services/eventService');

beforeEach(() => {
    vi.clearAllMocks();
    //Default: the backend accepts the event. Individual tests override for failure cases.
    createEvent.mockResolvedValue({ id: 1 });
});

afterEach(() => {
    vi.restoreAllMocks();
});

//Helpers so tests read as user actions, not DOM plumbing
const fillField = (label, value) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

const submitForm = () =>
    fireEvent.click(screen.getByRole('button', { name: 'Registrar evento' }));

describe('EventForm', () => {
    it('renders a labelled input for every evento field and a submit button', () => {
        render(<EventForm />);

        const labels = [
            'Nombre:', 'Descripcion:', 'Fecha:', 'Hora:',
            'Precio mínimo:', 'Precio máximo:', 'Localidad:',
            'Género:', 'Nombre del recinto:', 'URL de la imagen:',
        ];
        labels.forEach((label) =>
            expect(screen.getByLabelText(label)).toBeInTheDocument()
        );
        expect(screen.getByRole('button', { name: 'Registrar evento' })).toBeInTheDocument();
    });

    it('reflects typed text back into the input (controlled component wiring)', () => {
        render(<EventForm />);

        fillField('Nombre:', 'Jazz Night');

        expect(screen.getByLabelText('Nombre:')).toHaveValue('Jazz Night');
    });

    it('submits the form data to the event service', async () => {
        render(<EventForm />);

        fillField('Nombre:', 'Jazz Night');
        fillField('Localidad:', 'Madrid');
        fillField('Fecha:', '2026-09-12');
        fillField('Hora:', '20:30');
        submitForm();

        await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
        expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
            nombre: 'Jazz Night',
            localidad: 'Madrid',
            fechaEvento: '2026-09-12',
            horaEvento: '20:30',
        }));
    });

    it('sends the prices as numbers, not strings', async () => {
        render(<EventForm />);

        fillField('Precio mínimo:', '15');
        fillField('Precio máximo:', '45');
        submitForm();

        await waitFor(() =>
            expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
                precioMinimo: 15,
                precioMaximo: 45,
            }))
        );
    });

    it('clears the form after a successful creation', async () => {
        render(<EventForm />);

        fillField('Nombre:', 'Jazz Night');
        fillField('Localidad:', 'Madrid');
        submitForm();

        await waitFor(() => expect(screen.getByLabelText('Nombre:')).toHaveValue(''));
        expect(screen.getByLabelText('Localidad:')).toHaveValue('');
    });

    it('keeps the form values when the service rejects, so the user can retry', async () => {
        createEvent.mockRejectedValue(new Error('Error 500'));
        vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

        render(<EventForm />);

        fillField('Nombre:', 'Jazz Night');
        submitForm();

        await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
        expect(screen.getByLabelText('Nombre:')).toHaveValue('Jazz Night');
    });
});
