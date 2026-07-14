import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Temporal } from 'temporal-polyfill';

import { environment } from '../../environments/environment';
import { Event } from '../models/event';
import { EventService } from './event';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  const mockEvent: Event = {
    id: '1',
    title: 'Test Concert',
    description: 'Test description',
    eventDate: Temporal.PlainDate.from('2026-08-15'),
    eventTime: Temporal.PlainTime.from('21:00'),
    minPrice: 20,
    maxPrice: 80,
    city: 'Valencia',
    genre: 'Rock',
    venueName: 'Test Hall',
    image: 'test.jpg',
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

    const req = httpMock.expectOne(`${environment.apiUrl}/api/events/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });
});