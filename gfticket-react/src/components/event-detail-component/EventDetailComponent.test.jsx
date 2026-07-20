import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EventDetail } from './EventDetailComponent';
import { getEventById, deleteEventById } from '../../services/eventService';

vi.mock('../../services/eventService');

const evento =
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
    };

beforeEach(() => {
    vi.clearAllMocks();
    getEventById.mockResolvedValue(evento);
    deleteEventById.mockResolvedValue(undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

//useParams only sees an :id if the component sits inside a matching route,
//so the wrapper mounts a real route tree and navigates to the given id.
//The /eventos marker route makes the post-delete navigation observable.
const renderDetail = (id = 1) =>
    render(
        <MemoryRouter initialEntries={[`/eventos/${id}`]}>
            <Routes>
                <Route path="/eventos" element={<p>listado de eventos (marcador)</p>} />
                <Route path="/eventos/:id" element={<EventDetail />} />
            </Routes>
        </MemoryRouter>
    );

describe('EventDetail', () => {
    it('shows a loading message while the event is being fetched', () => {
        //Never resolves during this test: the component stays in the loading state
        getEventById.mockReturnValue(new Promise(() => {}));

        renderDetail();

        expect(screen.getByText('Cargando evento...')).toBeInTheDocument();
    });

    it('requests the event whose id is in the URL', async () => {
        renderDetail(42);

        await waitForElementToBeRemoved(() => screen.queryByText('Cargando evento...'));

        //Route params are always strings, never numbers
        expect(getEventById).toHaveBeenCalledWith('42');
    });

    it('renders the event details once loaded', async () => {
        renderDetail();

        expect(await screen.findByRole('heading', { name: 'Jazz Night' })).toBeInTheDocument();
        expect(screen.getByText('Concierto de jazz en directo')).toBeInTheDocument();
        expect(screen.getByText('2026-09-12')).toBeInTheDocument();
        expect(screen.getByText('20:30')).toBeInTheDocument();
        expect(screen.getByText('Madrid')).toBeInTheDocument();
        expect(screen.getByText('Jazz')).toBeInTheDocument();
        expect(screen.getByText('Café Central')).toBeInTheDocument();
        expect(screen.getByText('15€ ~ 45€')).toBeInTheDocument();
    });

    it('shows the event image described by the event name', async () => {
        renderDetail();

        const img = await screen.findByRole('img', { name: 'Jazz Night' });
        expect(img).toHaveAttribute('src', evento.imagenUrl);
    });

    it('always offers a link back to the list', async () => {
        renderDetail();

        const link = await screen.findByRole('link', { name: '← Volver al listado' });
        expect(link).toHaveAttribute('href', '/eventos');
    });

    it('offers a link to edit the event once it is loaded', async () => {
        renderDetail();

        const editLink = await screen.findByRole('link', { name: /Editar/ });
        expect(editLink).toHaveAttribute('href', '/eventos/edit/1');
    });

    it('hides the edit link when the event could not be loaded', async () => {
        getEventById.mockRejectedValue(new Error('Error 404'));
        vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

        renderDetail(999);

        await screen.findByRole('alert');
        expect(screen.queryByRole('link', { name: /Editar/ })).not.toBeInTheDocument();
    });

    describe('delete (inline confirmation + redirect)', () => {
        it('offers a delete button that asks for inline confirmation first', async () => {
            renderDetail();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));

            //Nothing deleted yet: the user still has to confirm
            expect(deleteEventById).not.toHaveBeenCalled();
            expect(screen.getByText('¿Eliminar?')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Confirmar eliminación de Jazz Night' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancelar eliminación de Jazz Night' })).toBeInTheDocument();
        });

        it('deletes and navigates back to the list when confirmed', async () => {
            renderDetail();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación de Jazz Night' }));

            //Route params are strings, so the service receives '1'
            await waitFor(() => expect(deleteEventById).toHaveBeenCalledWith('1'));
            //This page's event no longer exists: the user must land back on the list
            expect(await screen.findByText('listado de eventos (marcador)')).toBeInTheDocument();
        });

        it('restores the toolbar actions when the confirmation is declined', async () => {
            renderDetail();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Cancelar eliminación de Jazz Night' }));

            expect(deleteEventById).not.toHaveBeenCalled();
            expect(screen.queryByText('¿Eliminar?')).not.toBeInTheDocument();
            //Still on the detail page, with both actions back
            expect(screen.getByRole('heading', { name: 'Jazz Night' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Editar/ })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Eliminar Jazz Night' })).toBeInTheDocument();
        });

        it('shows an error and stays on the page when the service rejects', async () => {
            deleteEventById.mockRejectedValue(new Error('Error 500'));
            vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

            renderDetail();

            fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Jazz Night' }));
            fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación de Jazz Night' }));

            expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar el evento.');
            //No navigation: the event still exists, the user stays where they were
            expect(screen.getByRole('heading', { name: 'Jazz Night' })).toBeInTheDocument();
            expect(screen.queryByText('listado de eventos (marcador)')).not.toBeInTheDocument();
        });
    });

    it('shows a not-found message when the API returns 404', async () => {
        getEventById.mockRejectedValue(new Error('Error 404'));
        vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

        renderDetail(999);

        expect(await screen.findByRole('alert')).toHaveTextContent('Evento con id: 999 no encontrado.');
    });

    it('shows a generic error message for any other failure', async () => {
        getEventById.mockRejectedValue(new Error('Error 500'));
        vi.spyOn(console, 'error').mockImplementation(() => {}); //silence the expected log

        renderDetail();

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el evento con id: 1.');
        expect(screen.queryByText('Evento no encontrado.')).not.toBeInTheDocument();
    });
});
