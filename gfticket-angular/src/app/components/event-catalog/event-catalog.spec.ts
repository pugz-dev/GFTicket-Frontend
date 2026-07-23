import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EventCatalog } from './event-catalog';
import { EventModel } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';

const MONTH_ABBRS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

describe('EventCatalog', () => {
  let component: EventCatalog;
  let fixture: ComponentFixture<EventCatalog>;
  let authServiceSpy: jest.Mocked<AuthService>;
  let router: Router;

  const mockEvents: EventModel[] = [
    {
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
      imagenUrl: 'test.jpg'
    },
    {
      id: 2,
      nombre: 'Test Theatre',
      descripcion: 'Test description',
      fechaEvento: '2026-08-28',
      horaEvento: '19:00',
      precioMinimo: 20,
      precioMaximo: 80,
      localidad: 'Zaragoza',
      genero: 'Blues',
      nombreRecinto: 'Test Hall',
      imagenUrl: 'test.jpg'
    }
  ];

  beforeEach(async () => {
    authServiceSpy = {
      estaAutenticado: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      imports: [EventCatalog],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCatalog);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows the event name, location, genre, date and image for each event', () => {
    fixture.componentRef.setInput('events', mockEvents);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const images = compiled.querySelectorAll('img');

    for (const [i, event] of mockEvents.entries()) {
      const eventDate = new Date(event.fechaEvento);
      expect(compiled.textContent).toContain(event.nombre);
      expect(compiled.textContent).toContain(`${eventDate.getDate()}`);
      expect(compiled.textContent).toContain(MONTH_ABBRS[eventDate.getMonth()]);
      expect(compiled.textContent).toContain(event.localidad);
      expect(compiled.textContent).toContain(event.genero);

      expect(images[i].getAttribute('src')).toBe(event.imagenUrl);
      expect(images[i].getAttribute('alt')).toBe(event.nombre);
    }
  });

  it('renders one card per event', () => {
    fixture.componentRef.setInput('events', mockEvents);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.event-card');
    expect(cards.length).toBe(mockEvents.length);
  });

  it('renders no cards when there are no events', () => {
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('.event-card');
    expect(cards.length).toBe(0);
  });

  it('links each card to its event detail page', () => {
    fixture.componentRef.setInput('events', mockEvents);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const links = compiled.querySelectorAll('.event-card');
    for (const [i, event] of mockEvents.entries()) {
      expect(links[i].getAttribute('href')).toBe(`/eventos/${event.id}`);
    }
  });

  describe('buy button', () => {
    it('is shown on every card when the user is authenticated', () => {
      authServiceSpy.estaAutenticado.mockReturnValue(true);
      fixture.componentRef.setInput('events', mockEvents);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const buttons = compiled.querySelectorAll('.event-card__buy-button');
      expect(buttons.length).toBe(mockEvents.length);
    });

    it('is hidden when the user is not authenticated', () => {
      authServiceSpy.estaAutenticado.mockReturnValue(false);
      fixture.componentRef.setInput('events', mockEvents);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const buttons = compiled.querySelectorAll('.event-card__buy-button');
      expect(buttons.length).toBe(0);
    });

    it('navigates to the cart for that event, without triggering the card link to the event detail', () => {
      authServiceSpy.estaAutenticado.mockReturnValue(true);
      fixture.componentRef.setInput('events', mockEvents);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const button = compiled.querySelector('.event-card__buy-button') as HTMLElement;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/carrito', mockEvents[0].id]);
    });
  });
});
