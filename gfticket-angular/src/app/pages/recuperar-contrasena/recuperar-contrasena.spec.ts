import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserStorageService } from '../../services/user-storage.service';
import { RecuperarContrasena } from './recuperar-contrasena';

describe('RecuperarContrasena', () => {
  let component: RecuperarContrasena;
  let fixture: ComponentFixture<RecuperarContrasena>;
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
      imports: [RecuperarContrasena],
      providers: [provideRouter([])],
    }).compileComponents();

    userStorageService = TestBed.inject(UserStorageService);
    userStorageService.registrarUsuario(usuario);

    fixture = TestBed.createComponent(RecuperarContrasena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('links back to the login page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const backLink = compiled.querySelector('a[href="/login"]');
    expect(backLink).toBeTruthy();
  });

  describe('validations', () => {
    it('marks email as required', () => {
      component.form.controls.email.setValue('');
      expect(component.form.controls.email.hasError('required')).toBe(true);
    });

    it('marks email invalid when it does not have a valid format', () => {
      component.form.controls.email.setValue('not-an-email');
      expect(component.form.controls.email.hasError('email')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('does not query the password when the form is invalid', () => {
      const spy = jest.spyOn(userStorageService, 'recuperarContrasena');

      component.onSubmit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('marks the field as touched when submitting an invalid form', () => {
      component.onSubmit();
      expect(component.form.controls.email.touched).toBe(true);
    });

    it('shows the password when the email matches a registered user', () => {
      component.form.controls.email.setValue(usuario.email);

      component.onSubmit();

      expect(component.contrasenaEncontrada).toBe(usuario.password);
      expect(component.noEncontrado).toBe(false);
    });

    it('shows an error when the email does not match any user', () => {
      component.form.controls.email.setValue('noexiste@test.com');

      component.onSubmit();

      expect(component.contrasenaEncontrada).toBeNull();
      expect(component.noEncontrado).toBe(true);
    });

    it('renders the recovered password in the DOM', () => {
      component.form.controls.email.setValue(usuario.email);

      const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain(usuario.password);
    });

    it('renders the not-found error in the DOM', () => {
      component.form.controls.email.setValue('noexiste@test.com');

      const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('No existe ninguna cuenta con ese email.');
    });
  });
});
