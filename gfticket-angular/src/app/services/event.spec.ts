import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { EventModel } from '../models/event.model';
import { EventService } from './event';

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

    const req = httpMock.expectOne(`${environment.apiUrl}/api/eventos/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });
});
