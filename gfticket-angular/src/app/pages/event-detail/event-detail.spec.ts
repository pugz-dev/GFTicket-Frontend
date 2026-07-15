import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { EventDetail } from './event-detail';

describe('EventDetail', () => {
  let component: EventDetail;
  let fixture: ComponentFixture<EventDetail>;
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
      imports: [EventDetail],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(EventDetail);
    component = fixture.componentInstance;
  }

  it('should create the component', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should read the event id from the route', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    expect(eventServiceSpy.getEventById).toHaveBeenCalledWith('1');
  });

  it('should call getEventById exactly once on ngOnInit', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    expect(eventServiceSpy.getEventById).toHaveBeenCalledTimes(1);
  });

  it('should show a loading state before the request resolves', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    expect(component.loading).toBe(true);
  });

  it('should assign the event data when the request succeeds', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    expect(component.event).toEqual(mockEvent);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(false);
  });

  it('should show all the event information in the DOM', () => {
    eventServiceSpy.getEventById.mockReturnValue(of(mockEvent));
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(mockEvent.nombre);
    expect(compiled.textContent).toContain(mockEvent.descripcion);
    expect(compiled.textContent).toContain(mockEvent.fechaEvento);
    expect(compiled.textContent).toContain(mockEvent.horaEvento);
    expect(compiled.textContent).toContain(mockEvent.localidad);
    expect(compiled.textContent).toContain(mockEvent.genero);
    expect(compiled.textContent).toContain(mockEvent.nombreRecinto);
    expect(compiled.textContent).toContain(`${mockEvent.precioMinimo}`);
    expect(compiled.textContent).toContain(`${mockEvent.precioMaximo}`);

    const image = compiled.querySelector('img');
    expect(image?.getAttribute('src')).toBe(mockEvent.imagenUrl);
    expect(image?.getAttribute('alt')).toBe(mockEvent.nombre);
  });

  it('should set the error state when the event does not exist (404)', () => {
    eventServiceSpy.getEventById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );
    createComponent();
    fixture.detectChanges();
    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.event).toBeNull();
  });

  it('should set the error state when the service fails (500)', () => {
    eventServiceSpy.getEventById.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );
    createComponent();
    fixture.detectChanges();
    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should show an error message in the DOM when error is true', () => {
    eventServiceSpy.getEventById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent?.toLowerCase()).toContain('not found');
  });
});
