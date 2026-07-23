import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { EventModel } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { UserStorageService } from '../../services/user-storage.service';
import { EventList } from './event-list';
import { provideRouter } from '@angular/router';

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
    localStorage.clear();

    eventServiceSpy = {
      getEventos: jest.fn(),
      getEventosByName: jest.fn(),
    } as unknown as jest.Mocked<EventService>;

    await TestBed.configureTestingModule({
      imports: [EventList],
      providers: [{ provide: EventService, useValue: eventServiceSpy },
      provideRouter([]),
      ],
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

  it('shows a login link pointing to /login', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const loginLink = compiled.querySelector('a[href="/login"]');
    expect(loginLink).toBeTruthy();
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
    expect(component.allEvents).toEqual(mockEvents);
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
    expect(component.allEvents).toEqual([]);
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

  it('calls getEventosByName with the typed text when the user types in the search input', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    eventServiceSpy.getEventosByName.mockReturnValue(of(mockEvents));
    createComponent();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.event-list__search-name');
    input.value = 'Concert';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(eventServiceSpy.getEventosByName).toHaveBeenCalledWith('Concert');
  });

  it('updates the displayed events with the search results', () => {
    const filtered = [mockEvents[0]];
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    eventServiceSpy.getEventosByName.mockReturnValue(of(filtered));
    createComponent();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.event-list__search-name');
    input.value = 'Concert';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.allEvents).toEqual(filtered);
  });

  it('shows all events again when the search input is cleared', () => {
    const filtered = [mockEvents[0]];
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    eventServiceSpy.getEventosByName
      .mockReturnValueOnce(of(filtered))
      .mockReturnValueOnce(of(mockEvents));
    createComponent();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.event-list__search-name');
    input.value = 'Concert';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.allEvents).toEqual(mockEvents);
  });

  it('sets the error state when the search request fails', () => {
    eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
    eventServiceSpy.getEventosByName.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );
    createComponent();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.event-list__search-name');
    input.value = 'Concert';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.error).toBe(true);
    expect(component.allEvents).toEqual([]);
  });

  describe('user menu', () => {
    function loginTestUser(): void {
      const authService = TestBed.inject(AuthService);
      const userStorageService = TestBed.inject(UserStorageService);
      userStorageService.registrarUsuario({
        nombre: 'Ana',
        apellidos: 'Garcia',
        email: 'ana@test.com',
        password: 'secret123',
        telefono: '611222333',
      });
      authService.loginUsuario({ email: 'ana@test.com', password: 'secret123' });
    }

    it('shows a login link when there is no active session', () => {
      eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
      createComponent();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.topbar__login')).toBeTruthy();
      expect(compiled.querySelector('.topbar__user')).toBeFalsy();
    });

    it('shows the user name and hides the login link when authenticated', () => {
      loginTestUser();

      eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
      createComponent();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.topbar__login')).toBeFalsy();
      expect(compiled.querySelector('.topbar__user-btn')?.textContent).toContain('Ana');
    });

    it('toggles the dropdown menu when the user button is clicked', () => {
      loginTestUser();

      eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
      createComponent();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.topbar__menu')).toBeFalsy();

      const userBtn = compiled.querySelector('.topbar__user-btn') as HTMLElement;
      userBtn.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.topbar__menu')).toBeTruthy();
    });

    it('logs the user out and shows the login link again', () => {
      const authService = TestBed.inject(AuthService);
      loginTestUser();

      eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
      createComponent();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      (compiled.querySelector('.topbar__user-btn') as HTMLElement).click();
      fixture.detectChanges();
      (compiled.querySelector('.topbar__menu-item') as HTMLElement).click();
      fixture.detectChanges();

      expect(component.menuOpen).toBe(false);
      expect(authService.estaAutenticado()).toBe(false);
      expect(compiled.querySelector('.topbar__login')).toBeTruthy();
    });

    it('closes the menu when clicking outside the component', () => {
      loginTestUser();

      eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
      createComponent();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      (compiled.querySelector('.topbar__user-btn') as HTMLElement).click();
      fixture.detectChanges();
      expect(compiled.querySelector('.topbar__menu')).toBeTruthy();

      document.body.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.topbar__menu')).toBeFalsy();
    });

    it('keeps the menu open when clicking inside the component but outside the toggle button', () => {
      loginTestUser();

      eventServiceSpy.getEventos.mockReturnValue(of(mockEvents));
      createComponent();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      (compiled.querySelector('.topbar__user-btn') as HTMLElement).click();
      fixture.detectChanges();

      (compiled.querySelector('.topbar__menu') as HTMLElement).click();
      fixture.detectChanges();

      expect(compiled.querySelector('.topbar__menu')).toBeTruthy();
    });
  });
});
