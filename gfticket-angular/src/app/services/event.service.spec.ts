import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { EventModel } from '../models/event.model';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  const mockEvent: EventModel = {
    id: 1,
    nombre: 'Test Concert',
    descripcion: 'Test description',
    fechaEvento: '2026-08-15',
    horaEvento: '21:00',
    precioMinimo: 20,
    precioMaximo: 80,
    localidad: 'Valencia',
    genero: 'Rock',
    nombreRecinto: 'Test Hall',
    imagenUrl: 'test.jpg',
  };

  const mockEvents: EventModel[] = [
    {
      id: 1,
      nombre: 'Test Concert',
      descripcion: 'Test description',
      fechaEvento: '2026-08-15',
      horaEvento: '21:00',
      precioMinimo: 20,
      precioMaximo: 80,
      localidad: 'Valencia',
      genero: 'Rock',
      nombreRecinto: 'Test Hall',
      imagenUrl: 'test.jpg'
    },
    {
      id: 2,
      nombre: 'Test Theatre',
      descripcion: 'Test description',
      fechaEvento: '2026-08-28',
      horaEvento: '19:00',
      precioMinimo: 20,
      precioMaximo: 80,
      localidad: 'Zaragoza',
      genero: 'Blues',
      nombreRecinto: 'Test Hall',
      imagenUrl: 'test.jpg'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the event from the configured API URL', () => {
    service.getEventById('1').subscribe((event) => {
      expect(event).toEqual(mockEvent);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });

  it('converts negative prices to positive for a single event', () => {
    const negativeEvent: EventModel = { ...mockEvent, precioMinimo: -20, precioMaximo: -80 };

    service.getEventById('1').subscribe((event) => {
      expect(event.precioMinimo).toBe(20);
      expect(event.precioMaximo).toBe(80);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos/1`);
    req.flush(negativeEvent);
  });

  it('propagates an error when getEventById fails', () => {
    service.getEventById('1').subscribe({
      next: () => fail('should not succeed'),
      error: (err) => expect(err).toBeTruthy(),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos/1`);
    req.flush('simulated error', { status: 500, statusText: 'Server Error' });
  });

  it('propagates a 404 error when the event is not found', () => {
    service.getEventById('999').subscribe({
      next: () => fail('should not succeed'),
      error: (err) => expect(err.status).toBe(404),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos/999`);
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('propagates a network error when getEventById has no connection', () => {
    service.getEventById('1').subscribe({
      next: () => fail('should not succeed'),
      error: (err) => expect(err.error).toBeInstanceOf(ProgressEvent),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos/1`);
    req.error(new ProgressEvent('error'));
  });

  it('returns the list of events when the request succeeds', () => {
    service.getEventos().subscribe((events) => {
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('converts negative prices to positive for every event in the list', () => {
    const negativeEvents: EventModel[] = mockEvents.map((event) => ({
      ...event,
      precioMinimo: -event.precioMinimo,
      precioMaximo: -event.precioMaximo,
    }));

    service.getEventos().subscribe((events) => {
      events.forEach((event, i) => {
        expect(event.precioMinimo).toBe(mockEvents[i].precioMinimo);
        expect(event.precioMaximo).toBe(mockEvents[i].precioMaximo);
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.flush(negativeEvents);
  });

  it('propagates an error when the request fails', () => {
    service.getEventos().subscribe({
      next: () => fail('should not succeed'),
      error: (err) => expect(err).toBeTruthy(),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.flush('simulated error', { status: 500, statusText: 'Server Error' });
  });

  it('returns an empty array when the API returns no events', () => {
    service.getEventos().subscribe((events) => {
      expect(events).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('propagates a network error when getEventos has no connection', () => {
    service.getEventos().subscribe({
      next: () => fail('should not succeed'),
      error: (err) => expect(err.error).toBeInstanceOf(ProgressEvent),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.error(new ProgressEvent('error'));
  });

  it('returns all the events when the input name is blank', () => {
    service.getEventosByName('').subscribe((events) => {
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('returns events whose name contains the search text (partial match)', () => {
    service.getEventosByName('Concert').subscribe((events) => {
      expect(events).toEqual([mockEvents[0]]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('matches the name case-insensitively', () => {
    service.getEventosByName('concert').subscribe((events) => {
      expect(events).toEqual([mockEvents[0]]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.flush(mockEvents);
  });

  it('returns an empty array when no event matches the name', () => {
    service.getEventosByName('Jazz').subscribe((events) => {
      expect(events).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.flush(mockEvents);
  });

  it('treats a whitespace-only name as blank and returns all events', () => {
    service.getEventosByName('   ').subscribe((events) => {
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.flush(mockEvents);
  });

  it('propagates an error when the underlying getEventos request fails', () => {
    service.getEventosByName('Concert').subscribe({
      next: () => fail('should not succeed'),
      error: (err) => expect(err).toBeTruthy(),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/eventos`);
    req.flush('simulated error', { status: 500, statusText: 'Server Error' });
  });

});
