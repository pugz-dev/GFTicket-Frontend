import { describe, it, expect, vi, beforeEach} from 'vitest';
import { getEvents, getEventById, createEvent, updateEventById, deleteEventById } from './eventService';
import { toEvento } from '../models/eventModel';

const API_URL = import.meta.env.VITE_API_URL;

//Mock global function 'fetch'
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

const jsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
});

//testing payload
const newEvent = {
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

describe('getEvents', () => {
    it('Receiving a correct response with no data/empty list returns an empty list', async () => {
        
        fetch.mockResolvedValue(jsonResponse([]));
        const result = await getEvents();

        expect(fetch).toHaveBeenCalledWith(API_URL);
        expect(result).toEqual([]);
    });

    it('returns the events mapped to the front-end model (horaEvento as "HH:mm")', async () => {
        //horaEvento comes from the API as a LocalTime object, not a string
        const dtos = [
            { id: 1, ...newEvent, horaEvento: { hour: 20, minute: 30, second: 0, nano: 0 } },
            { id: 2, ...newEvent, nombre: 'Morning Chill', horaEvento: { hour: 9, minute: 5, second: 0, nano: 0 } },
        ];
        fetch.mockResolvedValue(jsonResponse(dtos));

        const result = await getEvents();

        expect(fetch).toHaveBeenCalledWith(API_URL);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(expect.objectContaining({
            id: 1,
            nombre: 'Jazz Night',
            horaEvento: '20:30',
        }));
        //Single-digit hour/minute must come out zero-padded
        expect(result[1].horaEvento).toBe('09:05');
    });

    it('returns an empty list when the API responds 204 No Content', async () => {
        //A 204 has no body: json() must never be called on it
        fetch.mockResolvedValue({
            ok: true,
            status: 204,
            json: () => Promise.reject(new Error('204 has no body')),
        });

        const result = await getEvents();

        expect(result).toEqual([]);
    });

    it('Incorrect response returns an error message', async () => {
        
        fetch.mockResolvedValue({ok: false, status : 500, json: () => '[]'});
        await expect( getEvents() ).rejects.toThrow(`Error 500`) ;

    });

});

describe('getEventById', () => {
    it('Receiving a correct response with no data/empty object returns an empty object', async () => {

        fetch.mockResolvedValue(jsonResponse({}));
        const result = await getEventById(1);

        expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`);
        expect(result).toEqual(toEvento({}));
    });

    it('fetches the event by its id and maps it to the front-end model', async () => {
        //horaEvento comes from the API as a LocalTime object, not a string
        const dto = { id: 42, ...newEvent, horaEvento: { hour: 20, minute: 30, second: 0, nano: 0 } };
        fetch.mockResolvedValue(jsonResponse(dto));

        const result = await getEventById(42);

        expect(fetch).toHaveBeenCalledWith(`${API_URL}/42`);
        expect(result).toEqual(expect.objectContaining({
            id: 42,
            nombre: 'Jazz Night',
            horaEvento: '20:30',
            nombreRecinto: 'Café Central',
        }));
    });

    it('rejects with the status code when the event does not exist (404)', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'Evento no encontrado' }, 404));

        await expect(getEventById(999)).rejects.toThrow('Error 404');
    });
});

describe('createEvent',() =>{
    it('Creating an empty object returns an OK response of an empty event', async () =>{
        fetch.mockResolvedValue( jsonResponse({}) );
        const result = await createEvent({});

        expect(fetch).toHaveBeenCalledWith(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        expect(result).toEqual(toEvento({}))
    });

    it('POSTs the event as JSON and returns the created entity', async () => {
        const created = { id: 42, ...newEvent };
        fetch.mockResolvedValue(jsonResponse(created, 201));

        const result = await createEvent(newEvent);

        expect(fetch).toHaveBeenCalledWith(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent),
        });
        expect(result).toEqual(created);
    });

    it('rejects with the status code when validation fails (400)', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'nombre es obligatorio' }, 400));

        await expect(createEvent(newEvent)).rejects.toThrow('Error 400');
    });

    
});

describe('updateEventById', () => {
    it('PUTs the event as JSON to its URL and returns the updated entity mapped', async () => {
        const payload = { ...newEvent, nombre: 'Jazz Night (sala grande)' };
        //The API echoes the updated entity back, horaEvento as a LocalTime object
        const updatedDto = { id: 42, ...payload, horaEvento: { hour: 21, minute: 0, second: 0, nano: 0 } };
        fetch.mockResolvedValue(jsonResponse(updatedDto));

        const result = await updateEventById(42, payload);

        expect(fetch).toHaveBeenCalledWith(`${API_URL}/42`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(expect.objectContaining({
            id: 42,
            nombre: 'Jazz Night (sala grande)',
            horaEvento: '21:00',
        }));
    });

    it('rejects with the status code when the event does not exist (404)', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'Evento no encontrado' }, 404));

        await expect(updateEventById(999, newEvent)).rejects.toThrow('Error 404');
    });

    it('rejects with the status code when validation fails (400)', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'nombre es obligatorio' }, 400));

        await expect(updateEventById(42, { ...newEvent, nombre: '' })).rejects.toThrow('Error 400');
    });
});

describe('deleteEventById', () => {
    it('sends a DELETE for the given id and resolves with no value', async () => {
        //Typical DELETE response: 204 with no body; json() must never be called
        fetch.mockResolvedValue({
            ok: true,
            status: 204,
            json: () => Promise.reject(new Error('204 has no body')),
        });

        await expect(deleteEventById(7)).resolves.toBeUndefined();

        expect(fetch).toHaveBeenCalledWith(`${API_URL}/7`, { method: 'DELETE' });
    });

    it('rejects with the status code when the event does not exist (404)', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'Evento no encontrado' }, 404));

        await expect(deleteEventById(999)).rejects.toThrow('Error 404');
    });

    it('rejects with the status code on a server error (500)', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'boom' }, 500));

        await expect(deleteEventById(7)).rejects.toThrow('Error 500');
    });
});