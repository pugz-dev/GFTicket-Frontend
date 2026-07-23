import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserStorageService } from '../../services/user-storage.service';
import { Perfil } from './perfil';

describe('Perfil', () => {
  let component: Perfil;
  let fixture: ComponentFixture<Perfil>;
  let authService: AuthService;
  let userStorageService: UserStorageService;

  const usuario = {
    nombre: 'Ana',
    apellidos: 'Garcia',
    email: 'ana@test.com',
    password: 'secret123',
    telefono: '600111222',
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Perfil],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    userStorageService = TestBed.inject(UserStorageService);
    userStorageService.registrarUsuario(usuario);
    authService.loginUsuario({ email: usuario.email, password: usuario.password });

    fixture = TestBed.createComponent(Perfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('preloads the form with the logged in user data', () => {
    expect(component.form.getRawValue()).toEqual({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
    });
  });

  describe('validations', () => {
    it('marks nombre as required', () => {
      component.form.controls.nombre.setValue('');
      expect(component.form.controls.nombre.hasError('required')).toBe(true);
    });

    it('marks email invalid when it does not have a valid format', () => {
      component.form.controls.email.setValue('not-an-email');
      expect(component.form.controls.email.hasError('email')).toBe(true);
    });

    it('marks telefono invalid when it does not have 9 digits', () => {
      component.form.controls.telefono.setValue('12345');
      expect(component.form.controls.telefono.hasError('pattern')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('does not persist changes when the form is invalid', () => {
      component.form.controls.nombre.setValue('');

      component.onSubmit();

      const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored[0].nombre).toBe(usuario.nombre);
    });

    it('marks every field as touched when submitting an invalid form', () => {
      component.form.controls.nombre.setValue('');

      component.onSubmit();

      expect(component.form.controls.nombre.touched).toBe(true);
    });

    it('persists the updated data in localStorage when the form is valid', () => {
      component.form.controls.nombre.setValue('Ana Maria');

      component.onSubmit();

      const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored[0].nombre).toBe('Ana Maria');
    });

    it('refreshes the current user in AuthService', () => {
      component.form.controls.nombre.setValue('Ana Maria');

      component.onSubmit();

      expect(authService.usuarioActual()?.nombre).toBe('Ana Maria');
    });

    it('shows a success message once the changes are saved', () => {
      const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Los cambios se han guardado correctamente.');
    });
  });
});