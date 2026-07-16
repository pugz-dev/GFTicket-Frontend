import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { PublicHome } from './public-home';

describe('PublicHome', () => {
  let component: PublicHome;
  let fixture: ComponentFixture<PublicHome>;
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
  ];

  beforeEach(async () => {
    eventServiceSpy = {
      getEventos: jest.fn(),
    } as unknown as jest.Mocked<EventService>;
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));

    await TestBed.configureTestingModule({
      imports: [PublicHome],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicHome);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows the header title and subtitle in the DOM', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('GFTicket');
    expect(compiled.textContent).toContain('Descubre y reserva las entradas');
  });

  it('renders the event-list component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-event-list')).toBeTruthy();
  });
});
