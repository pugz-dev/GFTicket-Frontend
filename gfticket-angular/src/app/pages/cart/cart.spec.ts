import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cart } from './cart';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let eventServiceSpy: jest.Mocked<EventService>;

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

  beforeEach(async () => {

    eventServiceSpy = {
      getEventById: jest.fn(),
    } as unknown as jest.Mocked<EventService>;

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the event information in the cart DOM', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
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
    expect(component.loading).toBe(true);
  });

  it('sets the error state when the event does not exist (404)', () => {
    eventServiceSpy.getEventById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );
    fixture.detectChanges();
    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('links back to the catalog', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const backLink = compiled.querySelector('a.back-link');
    expect(backLink?.getAttribute('href')).toBe('/eventos');
  });
});
