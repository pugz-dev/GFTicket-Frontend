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

const blurField = (label) =>
    fireEvent.blur(screen.getByLabelText(label));

const submitForm = () =>
    fireEvent.click(screen.getByRole('button', { name: 'Registrar evento' }));

//Every required field with valid values; submit stays disabled without them
const fillValidForm = () => {
    fillField('Nombre:', 'Jazz Night');
    fillField('Fecha:', '2026-09-12');
    fillField('Hora:', '20:30');
    fillField('Precio mínimo:', '15');
    fillField('Precio máximo:', '45');
    fillField('Localidad:', 'Madrid');
    fillField('Nombre del recinto:', 'Teatro Real');
};

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

    it('marks exactly the mandatory fields as required (asterisk via CSS)', () => {
        render(<EventForm />);

        //The red * is a ::after pseudo-element, invisible to jsdom; the contract
        //the CSS hangs on is the modifier class on each mandatory field
        const isRequired = (label) =>
            screen.getByLabelText(label).closest('.event-form__field')
                .classList.contains('event-form__field--required');

        ['Nombre:', 'Fecha:', 'Hora:', 'Precio mínimo:', 'Precio máximo:',
         'Localidad:', 'Nombre del recinto:'].forEach((label) =>
            expect(isRequired(label), `${label} should be marked required`).toBe(true)
        );
        ['Descripcion:', 'Género:', 'URL de la imagen:'].forEach((label) =>
            expect(isRequired(label), `${label} should NOT be marked required`).toBe(false)
        );
    });

    it('reflects typed text back into the input (controlled component wiring)', () => {
        render(<EventForm />);

        fillField('Nombre:', 'Jazz Night');

        expect(screen.getByLabelText('Nombre:')).toHaveValue('Jazz Night');
    });

    it('submits the form data to the event service', async () => {
        render(<EventForm />);

        fillValidForm();
        submitForm();

        await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
        expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
            nombre: 'Jazz Night',
            localidad: 'Madrid',
            fechaEvento: '2026-09-12',
            horaEvento: '20:30',
            nombreRecinto: 'Teatro Real',
        }));
    });

    it('sends the prices as numbers, not strings', async () => {
        render(<EventForm />);

        fillValidForm();
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

        fillValidForm();
        submitForm();

        await waitFor(() => expect(screen.getByLabelText('Nombre:')).toHaveValue(''));
        expect(screen.getByLabelText('Localidad:')).toHaveValue('');
    });

    it('keeps the form values when the service rejects, so the user can retry', async () => {
        createEvent.mockRejectedValue(new Error('Error 500'));
        vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

        render(<EventForm />);

        fillValidForm();
        submitForm();

        await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
        expect(screen.getByLabelText('Nombre:')).toHaveValue('Jazz Night');
    });

    describe('validation', () => {
        it('shows no validation errors on a pristine form', () => {
            render(<EventForm />);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('shows a required error after blurring an empty required field', () => {
            render(<EventForm />);

            blurField('Nombre:');

            expect(screen.getByRole('alert')).toHaveTextContent('Este campo es obligatorio.');
        });

        it('only shows errors for the fields that were touched', () => {
            render(<EventForm />);

            blurField('Nombre:');

            //Localidad, fecha, etc. are also empty, but untouched: exactly one alert
            expect(screen.getAllByRole('alert')).toHaveLength(1);
        });

        it('shows a minlength error when nombre has fewer than 3 characters', () => {
            render(<EventForm />);

            fillField('Nombre:', 'Ja');
            blurField('Nombre:');

            expect(screen.getByRole('alert')).toHaveTextContent('al menos 3 caracteres');
        });

        it('removes the error once the field becomes valid', () => {
            render(<EventForm />);

            blurField('Nombre:');
            expect(screen.getByRole('alert')).toBeInTheDocument();

            fillField('Nombre:', 'Jazz Night');

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('rejects a precio máximo lower than the precio mínimo', () => {
            render(<EventForm />);

            fillField('Precio mínimo:', '50');
            fillField('Precio máximo:', '20');
            blurField('Precio máximo:');

            expect(screen.getByRole('alert')).toHaveTextContent(
                'El precio máximo no puede ser menor que el mínimo.'
            );
        });

        it('does not validate the optional fields', () => {
            render(<EventForm />);

            blurField('Descripcion:');
            blurField('Género:');
            blurField('URL de la imagen:');

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('disables the submit button while the form is invalid', () => {
            render(<EventForm />);

            expect(screen.getByRole('button', { name: 'Registrar evento' })).toBeDisabled();
        });

        it('does not call the service if an invalid form is submitted anyway', async () => {
            render(<EventForm />);

            fireEvent.submit(screen.getByRole('button', { name: 'Registrar evento' }).closest('form'));

            //Give any pending promise a chance to resolve before asserting
            await waitFor(() => expect(createEvent).not.toHaveBeenCalled());
        });

        it('enables the submit button once every required field is valid', () => {
            render(<EventForm />);

            fillValidForm();

            expect(screen.getByRole('button', { name: 'Registrar evento' })).toBeEnabled();
        });

        it('shows no submit feedback on a pristine form', () => {
            render(<EventForm />);

            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        it('shows a success message beneath the button after the event is created', async () => {
            render(<EventForm />);

            fillValidForm();
            submitForm();

            const status = await screen.findByRole('status');
            expect(status).toHaveTextContent('Evento creado correctamente.');
        });

        it('shows an error alert instead when the service rejects', async () => {
            createEvent.mockRejectedValue(new Error('Error 500'));
            vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

            render(<EventForm />);

            fillValidForm();
            submitForm();

            expect(await screen.findByRole('alert')).toHaveTextContent(
                'No se pudo crear el evento. Inténtalo de nuevo.'
            );
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        it('dismisses the success message as soon as the user types again', async () => {
            render(<EventForm />);

            fillValidForm();
            submitForm();
            await screen.findByRole('status');

            fillField('Nombre:', 'Otro evento');

            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        it('dismisses the error alert as soon as the user types again', async () => {
            createEvent.mockRejectedValue(new Error('Error 500'));
            vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

            render(<EventForm />);

            fillValidForm();
            submitForm();
            await screen.findByRole('alert');

            fillField('Nombre:', 'Jazz Night corregido');

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('resets touched after a successful submit, so the emptied form shows no errors', async () => {
            render(<EventForm />);

            fillValidForm();
            //Touch every required field: without the reset these would all alert once cleared
            blurField('Nombre:');
            blurField('Localidad:');
            submitForm();

            await waitFor(() => expect(screen.getByLabelText('Nombre:')).toHaveValue(''));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
