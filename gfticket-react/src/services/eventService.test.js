import { describe, it, expect, vi, beforeEach} from 'vitest';
import { getEvents, getEventById, createEvent } from './eventService';
import { toEvento } from '../models/eventModel';

const API_URL = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';

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
        
        fetch.mockResolvedValue({ok: true, status : 200, json: () => '{}'});
        const result = await getEventById(1);

        expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`);
        expect(result).toEqual(toEvento({}));
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