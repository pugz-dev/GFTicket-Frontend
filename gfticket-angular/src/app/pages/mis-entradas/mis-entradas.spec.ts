import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MisEntradas } from './mis-entradas';
import { AuthService } from '../../services/auth.service';
import { UserModel } from '../../models/user.model';
import { TicketModel } from '../../models/ticket.model';

describe('MisEntradas', () => {
  let component: MisEntradas;
  let fixture: ComponentFixture<MisEntradas>;
  let authServiceSpy: jest.Mocked<AuthService>;

  const mockEntradas: TicketModel[] = [
    { eventId: 1, nombreEvento: 'Concierto de prueba', fecha: '2026-07-22T10:00:00.000Z', precioPagado: 45 },
    { eventId: 2, nombreEvento: 'Festival de prueba', fecha: '2026-08-10T10:00:00.000Z', precioPagado: 60 },
  ];

  const mockUsuario: UserModel = {
    id: 1,
    nombre: 'Ana',
    apellidos: 'Garcia',
    email: 'ana@test.com',
    password: 'secret123',
    telefono: '600111222',
    entradas: mockEntradas,
  };

  beforeEach(async () => {
    authServiceSpy = {
      usuarioActual: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      imports: [MisEntradas],
      providers: [{ provide: AuthService, useValue: authServiceSpy }, provideRouter([])],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(MisEntradas);
    component = fixture.componentInstance;
  }

  it('creates the component', () => {
    authServiceSpy.usuarioActual.mockReturnValue(mockUsuario);
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows an entry for each ticket the user has bought', () => {
    authServiceSpy.usuarioActual.mockReturnValue(mockUsuario);
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    for (const entrada of mockEntradas) {
      expect(compiled.textContent).toContain(entrada.nombreEvento);
      expect(compiled.textContent).toContain(`${entrada.precioPagado}`);
    }
  });

  it('renders one ticket card per entrada', () => {
    authServiceSpy.usuarioActual.mockReturnValue(mockUsuario);
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.entrada').length).toBe(mockEntradas.length);
  });

  it('shows an empty state message when the user has no tickets', () => {
    authServiceSpy.usuarioActual.mockReturnValue({ ...mockUsuario, entradas: [] });
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.entrada')).toBeNull();
    expect(compiled.textContent?.toLowerCase()).toContain('no tienes entradas');
  });

  it('shows an empty state message when entradas is undefined', () => {
    const { entradas, ...usuarioSinEntradas } = mockUsuario;
    authServiceSpy.usuarioActual.mockReturnValue(usuarioSinEntradas as UserModel);
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent?.toLowerCase()).toContain('no tienes entradas');
  });
});
