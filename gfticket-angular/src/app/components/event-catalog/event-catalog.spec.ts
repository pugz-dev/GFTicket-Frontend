import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventCatalog } from './event-catalog';
import { EventModel } from '../../models/event.model';

describe('EventCatalog', () => {
  let component: EventCatalog;
  let fixture: ComponentFixture<EventCatalog>;

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
    await TestBed.configureTestingModule({
      imports: [EventCatalog],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCatalog);
    component = fixture.componentInstance;
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
      expect(compiled.textContent).toContain(event.nombre);
      expect(compiled.textContent).toContain(event.fechaEvento);
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
});
