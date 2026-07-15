import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { EventList } from './event-list';

describe('EventList', () => {
  let component: EventList;
  let fixture: ComponentFixture<EventList>;
  let eventServiceSpy: jest.Mocked<EventService>;

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
      imagenUrl: 'test.jpg',
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
      imagenUrl: 'test.jpg',
    },
  ];

  beforeEach(async () => {
    eventServiceSpy = {
      getEventos: jest.fn(),
    } as unknown as jest.Mocked<EventService>;

    await TestBed.configureTestingModule({
      imports: [EventList],
      providers: [{ provide: EventService, useValue: eventServiceSpy }],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
  }

  it('creates the component', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls getEventos exactly once on ngOnInit', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    createComponent();
    fixture.detectChanges();
    expect(eventServiceSpy.getEventos).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state before the request resolves', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    createComponent();
    expect(component.loading).toBe(true);
  });

  it('assigns the events when the request succeeds', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    createComponent();
    fixture.detectChanges();
    expect(component.events).toEqual(mockEvents);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(false);
  });

  it('passes the events to EventCatalog for rendering', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.event-card');
    expect(cards.length).toBe(mockEvents.length);
  });

  it('sets the error state when the request fails', () => {
    eventServiceSpy.getEventos.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );
    createComponent();
    fixture.detectChanges();
    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.events).toEqual([]);
  });

  it('shows an error message in the DOM when error is true', () => {
    eventServiceSpy.getEventos.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent?.toLowerCase()).toContain('error');
  });
});
