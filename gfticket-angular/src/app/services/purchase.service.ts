import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventModel } from '../models/event.model';
import { TicketPurchaseModel } from '../models/tickets-purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {

    private readonly http = inject(HttpClient);

    compraEntradas(purchase: TicketPurchaseModel, event: EventModel): Observable<any> {
        const body = {
            ...purchase.cardData, /// "..." = Operador Spread, expande nombreTitular, numeroTarjeta, mesCaducidad, yearCaducidad y cvv como propiedades sueltas del nuevo objeto — evita que tengas que escribirlas una a una a mano. Es como el "builder pattern" pero sin builder, usando la sintaxis nativa de JS/TS
            emisor: 'GFTicket',
            concepto: event.nombre,
            cantidad: String(Math.random() * (event.precioMaximo - event.precioMinimo) + event.precioMinimo),
        }

        return this.http.post(`${environment.apiUrl}/pasarela/compra`, body);
    }

}
