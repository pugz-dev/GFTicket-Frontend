import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
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

describe('EventDetail', () =>{

});