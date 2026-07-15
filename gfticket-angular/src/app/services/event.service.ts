import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventModel } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  getEventById(id: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${environment.apiUrl}/eventos/${id}`);
  }

  getEventos(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${environment.apiUrl}/eventos`);
  }
}
