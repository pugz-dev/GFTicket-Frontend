import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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

  getEventosByName(name: string): Observable<EventModel[]> {
    const busqueda = name.trim().toLowerCase();

    return this.getEventos().pipe(
      map((eventos) =>
        busqueda === ''
          ? eventos
          : eventos.filter((evento) => evento.nombre.toLowerCase().includes(busqueda))
      )
    );
  }

  getEventosByLocality(locality: string): Observable<EventModel[]> {
    const busqueda = locality.trim().toLowerCase();

    return this.getEventos().pipe(
      map((eventos) =>
        busqueda === ''
          ? eventos
          : eventos.filter((evento) => evento.localidad.toLowerCase().match(busqueda))
      )
    );
  }
}
