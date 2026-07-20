import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EventList } from './EventList';
import { getEvents, deleteEventById } from '../../services/eventService';

//Replace the whole service module with mocks: no HTTP happens, and every call can be inspected
vi.mock('../../services/eventService');

//The component renders <Link>, which needs a Router in scope
const renderList = () =>
    render(<EventList />, { wrapper: MemoryRouter });

//Events as they leave the service: already mapped to the front-end model
const eventos = [
    {
        id: 1,
        nombre: 'Jazz Night',
        descripcion: 'Concierto de jazz en directo',
        fechaEvento: '2026-09-12',
        horaEvento: '20:30',
        precioMinimo: 15,
        precioMaximo: 45,
        localidad: 'Madrid',
        genero: 'Jazz',
        nombreRecinto: 'Café Central',
        imagenUrl: 'https://example.com/jazz.jpg',
    },
    {
        id: 2,
        nombre: 'Festival Gratuito',
        descripcion: 'Entrada libre',
        fechaEvento: '2026-10-01',
        horaEvento: '18:00',
        precioMinimo: 0,
        precioMaximo: 0,
        localidad: 'Sevilla',
        genero: 'Indie',
        nombreRecinto: 'Parque del Alamillo',
        imagenUrl: 'https://example.com/indie.jpg',
    },
];

beforeEach(() => {
    vi.clearAllMocks();
    getEvents.mockResolvedValue(eventos);
    deleteEventById.mockResolvedValue(undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('EventList', () => {
    it('shows a loading message while the events are being fetched', () => {
        //Never resolves during this test: the component stays in the loading state
        getEvents.mockReturnValue(new Promise(() => {}));

        renderList();

        expect(screen.getByText('Cargando eventos...')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('renders a table row per event once loaded', async () => {
        renderList();

        expect(await screen.findByRole('table')).toBeInTheDocument();
        //One row per event plus the header row
        expect(screen.getAllByRole('row')).toHaveLength(eventos.length + 1);
        expect(screen.getByText('Jazz Night')).toBeInTheDocument();
        expect(screen.getByText('Madrid')).toBeInTheDocument();
        expect(screen.getByText('20:30')).toBeInTheDocument();
        expect(screen.getByText('Hay 2 eventos disponibles')).toBeInTheDocument();
    });

    it('removes the loading message once the fetch finishes', async () => {
        renderList();

        await waitForElementToBeRemoved(() => screen.queryByText('Cargando eventos...'));
    });

    it('links each event name to its detail page', async () => {
        renderList();

        const link = await screen.findByRole('link', { name: 'Jazz Night' });
        expect(link).toHaveAttribute('href', '/eventos/1');
    });

    it('offers an accessible edit link per row', async () => {
        renderList();

        //The pencil is decorative; the accessible name says what it edits
        const editLink = await screen.findByRole('link', { name: 'Editar Jazz Night' });
        expect(editLink).toHaveAttribute('href', '/eventos/edit/1');
    });

    it('renders the price range, keeping 0 as a real price (free events)', async () => {
        renderList();

        expect(await screen.findByText('15€ ~ 45€')).toBeInTheDocument();
        //0 is falsy but valid: must not fall back to N/A
        expect(screen.getByText('0€ ~ 0€')).toBeInTheDocument();
    });

    it('shows the empty state when the API returns no events', async () => {
        getEvents.mockResolvedValue([]);

        renderList();

        expect(await screen.findByText('No hay eventos disponibles.')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    describe('delete (inline confirmation, no browser dialogs)', () => {
        it('replaces the row actions with an inline confirmation instead of deleting immediately', async () => {
            renderList();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));

            //Nothing deleted yet: the user still has to confirm
            expect(deleteEventById).not.toHaveBeenCalled();
            expect(screen.getByText('¿Eliminar?')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Confirmar eliminación de Jazz Night' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancelar eliminación de Jazz Night' })).toBeInTheDocument();
        });

        it('deletes and removes the row when the confirmation is accepted', async () => {
            renderList();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación de Jazz Night' }));

            await waitFor(() => expect(deleteEventById).toHaveBeenCalledWith(1));
            //The deleted event must leave the table without a page reload
            await waitFor(() => expect(screen.queryByText('Jazz Night')).not.toBeInTheDocument());
            expect(screen.getByText('Hay 1 eventos disponibles')).toBeInTheDocument();
        });

        it('restores the normal actions when the confirmation is declined', async () => {
            renderList();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Cancelar eliminación de Jazz Night' }));

            expect(deleteEventById).not.toHaveBeenCalled();
            expect(screen.getByText('Jazz Night')).toBeInTheDocument();
            expect(screen.queryByText('¿Eliminar?')).not.toBeInTheDocument();
            //The trash button is back for another try
            expect(screen.getByRole('button', { name: 'Eliminar Jazz Night' })).toBeInTheDocument();
        });

        it('only one row shows the confirmation at a time', async () => {
            renderList();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Eliminar Festival Gratuito' }));

            //The confirmation moved to the second row
            expect(screen.queryByRole('button', { name: 'Confirmar eliminación de Jazz Night' })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Confirmar eliminación de Festival Gratuito' })).toBeInTheDocument();
        });

        it('shows a delete-specific error and keeps the row when the service rejects', async () => {
            deleteEventById.mockRejectedValue(new Error('Error 500'));
            vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

            renderList();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación de Jazz Night' }));

            expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar el evento.');
            //Not the load-error message, and the row survives
            expect(screen.queryByText('Error al cargar los eventos.')).not.toBeInTheDocument();
            expect(screen.getByText('Jazz Night')).toBeInTheDocument();
        });
    });

    it('shows an error alert when the fetch fails, without the empty state', async () => {
        getEvents.mockRejectedValue(new Error('Error 500'));
        vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

        renderList();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Error al cargar los eventos.'
        );
        expect(screen.queryByText('No hay eventos disponibles.')).not.toBeInTheDocument();
        expect(screen.queryByText('Cargando eventos...')).not.toBeInTheDocument();
    });
});
