import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Event } from '../models/event';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${environment.apiUrl}/api/events/${id}`);
  }
}