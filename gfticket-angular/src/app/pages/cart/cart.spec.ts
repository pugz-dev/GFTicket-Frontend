import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cart } from './cart';
import { EventService } from '../../services/event.service';
import { PurchaseService } from '../../services/purchase.service';
import { EventModel } from '../../models/event.model';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let eventServiceSpy: jest.Mocked<EventService>;
  let purchaseServiceSpy: jest.Mocked<PurchaseService>;
  let router: Router;

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

  const validFormValue = {
    email: 'user@example.com',
    nombreTitular: 'Antonio Santos Ramos',
    numeroTarjeta: '4624-0071-8793-4978',
    mesCaducidad: '12',
    yearCaducidad: '2026',
    cvv: '123',
  };

  const mockSuccessResponse = { status: '200', error: '200.0001. Transacción correcta' };
  const mockErrorResponse = { status: '400', error: '400.0003.Número Tarjeta no correcto' };

  beforeEach(async () => {
    eventServiceSpy = {
      getEventById: jest.fn(),
    } as unknown as jest.Mocked<EventService>;

    purchaseServiceSpy = {
      compraEntradas: jest.fn(),
      getMensajeError: jest.fn(),
    } as unknown as jest.Mocked<PurchaseService>;

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: PurchaseService, useValue: purchaseServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show the event information in the cart DOM', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(mockEvent.nombre);
    expect(compiled.textContent).toContain(`${mockEvent.precioMinimo}`);
    expect(compiled.textContent).toContain(`${mockEvent.precioMaximo}`);

    const image = compiled.querySelector('img');
    expect(image?.getAttribute('src')).toBe(mockEvent.imagenUrl);
    expect(image?.getAttribute('alt')).toBe(mockEvent.nombre);
  });

  it('shows a loading state before the request resolves', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    expect(component.loading).toBe(true);
  });

  it('sets the error state when the event does not exist (404)', () => {
    eventServiceSpy.getEventById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );
    createComponent();
    fixture.detectChanges();
    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('links back to the catalog', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const backLink = compiled.querySelector('a.back-link');
    expect(backLink?.getAttribute('href')).toBe('/eventos');
  });

  it('is invalid when the card form is empty', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();

    expect(component.form.valid).toBe(false);
  });

  it('is valid when all the card fields are filled in correctly', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();

    component.form.setValue(validFormValue);

    expect(component.form.valid).toBe(true);
  });

  it('does not call compraEntradas when the form is invalid', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();

    component.onSubmit();

    expect(purchaseServiceSpy.compraEntradas).not.toHaveBeenCalled();
  });

  it('calls compraEntradas with the form data and navigates to the confirmation page on success', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    purchaseServiceSpy.compraEntradas.mockReturnValue(of(mockSuccessResponse));
    createComponent();
    fixture.detectChanges();

    component.form.setValue(validFormValue);
    component.onSubmit();

    expect(purchaseServiceSpy.compraEntradas).toHaveBeenCalledWith(
      {
        email: validFormValue.email,
        eventId: mockEvent.id,
        cardData: {
          nombreTitular: validFormValue.nombreTitular,
          numeroTarjeta: validFormValue.numeroTarjeta,
          mesCaducidad: validFormValue.mesCaducidad,
          yearCaducidad: validFormValue.yearCaducidad,
          cvv: validFormValue.cvv,
        },
      },
      mockEvent,
    );
    expect(router.navigate).toHaveBeenCalledWith(['/confirmacion'], {
      state: { success: true, eventId: mockEvent.id },
    });
  });

  it('navigates to the confirmation page with the error code when the purchase fails', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    purchaseServiceSpy.compraEntradas.mockReturnValue(
      throwError(() => ({ error: mockErrorResponse })),
    );
    createComponent();
    fixture.detectChanges();

    component.form.setValue(validFormValue);
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/confirmacion'], {
      state: { success: false, codigoError: mockErrorResponse.error, eventId: mockEvent.id },
    });
  });
});
