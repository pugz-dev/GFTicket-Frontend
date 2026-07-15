import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EventDetail } from './EventDetailComponent';
import { getEventById } from '../../services/eventService';

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
});

afterEach(() => {
    vi.restoreAllMocks();
});

//useParams only sees an :id if the component sits inside a matching route,
//so the wrapper mounts a real route tree and navigates to the given id
const renderDetail = (id = 1) =>
    render(
        <MemoryRouter initialEntries={[`/eventos/${id}`]}>
            <Routes>
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
