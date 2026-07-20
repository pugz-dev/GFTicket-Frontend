import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { EventModel } from '../models/event.model';
import { TicketPurchaseModel } from '../models/tickets-purchase.model';
import { Observable } from 'rxjs';

const MENSAJES_ERROR: Record<string, string> = {
    '400.0001': 'No hay fondos suficientes en la tarjeta',
    '400.0002': 'No se encuentran los datos del cliente',
    '400.0003': 'El número de tarjeta no es válido',
    '400.0004': 'Formato del CVV no válido',
    '400.0005': 'Mes de caducidad incorrecto',
    '400.0006': 'Año de caducidad incorrecto',
    '400.0007': 'La tarjeta está caducada',
    '400.0008': 'El formato del nombre es incorrecto',
    '500.0001': 'El sistema de pago no está disponible ahora mismo. Inténtalo de nuevo en unos minutos'
};

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

    getMensajeError(codigoError: string): string {
        const codigo = codigoError.split('.').slice(0, 2).join('.'); // // "400.0003.Texto..." → "400.0003"
        return MENSAJES_ERROR[codigo] ?? 'Ha ocurrido un error al procesar el pago';
    }

}
