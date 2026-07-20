import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { CardDataModel } from '../models/card-data.model';
import { TicketPurchaseModel } from '../models/tickets-purchase.model';
import { EventModel } from '../models/event.model';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
    let service: PurchaseService;
    let httpMock: HttpTestingController;

    const mockCardData: CardDataModel = {
        nombreTitular: 'Leandro Paredes',
        numeroTarjeta: '0000 1111 2222 3333',
        mesCaducidad: '07',
        yearCaducidad: '2026',
        cvv: '019'
    };

    const mockTicketPurchase: TicketPurchaseModel = {
        email: 'leandroquepaso@email.com',
        eventId: 7,
        cardData: mockCardData
    };

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


    // Formato real confirmado con curl contra la pasarela — status es SIEMPRE string,
    // info devuelve los campos numéricos como number (aunque los envías como string).

    const mockSuccessResponse = {
        status: '200',
        error: '200.0001. Transacción correcta',
        message: ['...'], // mensajes variables, no comprobar el contenido literal en tests
        info: { nombreTitular: 'Antonio Santos Ramos', numeroTarjeta: '4624-0071-8793-4978', mesCaducidad: 12, yearCaducidad: 2026, cvv: 123, emisor: 'GFTicket', concepto: 'Entrada a concierto', cantidad: 100.5 },
        infoadicional: '...',
        timestamp: '20/07/2026 14:10:05',
    }; // ✅ verificado en vivo — caso de éxito

    const mockNoFundsResponse = {
        status: '400',
        error: '400.0001.Sin fondos',
        message: ['...'],
        info: { /* igual que arriba */ },
        infoadicional: '...',
        timestamp: '20/07/2026 14:08:53',
    }; // ✅ verificado en vivo — (✦) aleatorio, no depende de que los datos sean válidos

    const mockClientNotFoundResponse = {
        status: '400',
        error: '400.0002.No se encuentran los datos del cliente',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '...',
    }; // ⚠️ construido a partir del PDF, no reproducido en vivo — (✦) aleatorio

    const mockInvalidCardResponse = {
        status: '400',
        error: '400.0003.Número Tarjeta no correcto',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '20/07/2026 14:10:27',
    }; // ✅ verificado en vivo — determinista (tarjeta con formato inválido)

    const mockInvalidCvvResponse = {
        status: '400',
        error: '400.0004.Formato de CVV incorrecto',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '...',
    }; // ⚠️ construido a partir del PDF — determinista (cvv con formato inválido)

    const mockInvalidMonthResponse = {
        status: '400',
        error: '400.0005.Mes de caducidad incorrecto',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '...',
    }; // ⚠️ construido a partir del PDF — determinista

    const mockInvalidYearResponse = {
        status: '400',
        error: '400.0006.Año de caducidad incorrecto',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '...',
    }; // ⚠️ construido a partir del PDF — determinista

    const mockExpiredCardResponse = {
        status: '400',
        error: '400.0007.Fecha de caducidad debe ser posterior al día actual',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '...',
    }; // ⚠️ construido a partir del PDF — determinista

    const mockInvalidNameResponse = {
        status: '400',
        error: '400.0008.Formato de nombre incorrecto',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '',
        timestamp: '...',
    }; // ⚠️ construido a partir del PDF — determinista

    const mockUnstableSystemResponse = {
        status: '500',
        error: '500.0001.Sistema inestable',
        message: ['...'],
        info: { /* ... */ },
        infoadicional: '...',
        timestamp: '20/07/2026 14:10:06',
    }; // ✅ verificado en vivo — (✦) aleatorio


    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(PurchaseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('sends the correct payload and returns the gateway confirmation on success', () => {
        service.compraEntradas(mockTicketPurchase, mockEvent).subscribe((response) => {
            expect(response).toEqual(mockSuccessResponse);
        })

        const req = httpMock.expectOne(`${environment.apiUrl}/pasarela/compra`);
        expect(req.request.method).toBe('POST');

        expect(req.request.body.nombreTitular).toBe(mockCardData.nombreTitular);
        expect(req.request.body.numeroTarjeta).toBe(mockCardData.numeroTarjeta);
        expect(req.request.body.mesCaducidad).toBe(mockCardData.mesCaducidad);
        expect(req.request.body.yearCaducidad).toBe(mockCardData.yearCaducidad);
        expect(req.request.body.cvv).toBe(mockCardData.cvv);
        expect(req.request.body.emisor).toBe('GFTicket');
        expect(req.request.body.concepto).toBe(mockEvent.nombre);
        const cantidad = Number(req.request.body.cantidad);
        expect(cantidad).toBeGreaterThanOrEqual(mockEvent.precioMinimo);
        expect(cantidad).toBeLessThanOrEqual(mockEvent.precioMaximo);

        req.flush(mockSuccessResponse);
    });

    it('propagates an error when the card is rejected by the gateway', () => {
        service.compraEntradas(mockTicketPurchase, mockEvent).subscribe({
            next: () => fail('should not succeed'),
            error: (err) => {
                expect(err.error).toEqual(mockInvalidCardResponse);
            },
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/pasarela/compra`);
        req.flush(mockInvalidCardResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('propagates an error when the payment system is unstable', () => {
        service.compraEntradas(mockTicketPurchase, mockEvent).subscribe({
            next: () => fail('should not succeed'),
            error: (err) => {
                expect(err.error).toEqual(mockUnstableSystemResponse);
            },
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/pasarela/compra`);
        req.flush(mockUnstableSystemResponse, { status: 500, statusText: 'Internal Server Error' });
    });

});
