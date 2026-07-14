import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Event } from '../models/event';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`/api/events/${id}`);
  }
}