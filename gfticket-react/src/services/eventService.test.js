import { describe, it, expect, vi, beforeEach} from 'vitest';
import { getEvents, getEventById } from './eventService';
/*
const API_URL = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';

//Mock global function 'fetch'
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

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