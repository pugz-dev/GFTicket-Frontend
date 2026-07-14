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
/*
describe('getEvents', () => {
    it('Receiving a correct response with no data/empty list returns an empty list', async () => {
        
        fetch.mockResolvedValue({ok: true, status : 200, json: () => '[]'});
        const result = await getEvents();

        expect(fetch).toHaveBeenCalledWith(API_URL);
        expect(result).toEqual('[]');
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
        expect(result).toEqual('{}');
    });
});
*/
describe('true', () => {
    it('truthy', async () =>{
        expect(true).toBeTruthy();
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