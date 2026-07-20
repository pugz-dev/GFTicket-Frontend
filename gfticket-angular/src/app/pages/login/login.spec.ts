import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { UserStorageService } from '../../services/user-storage.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;
  let userStorageService: UserStorageService;

  const usuario = {
    nombre: 'Ana',
    apellidos: 'Garcia',
    email: 'ana@test.com',
    password: 'secret123',
    telefono: '611222333',
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    userStorageService = TestBed.inject(UserStorageService);
    userStorageService.registrarUsuario(usuario);

    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component.form.setValue({ email: usuario.email, password: usuario.password });
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('links to the register page for users who do not have an account', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const registerLink = compiled.querySelector('a[href="/registro"]');

    expect(registerLink).toBeTruthy();
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

    it('marks password as required', () => {
      component.form.controls.password.setValue('');
      expect(component.form.controls.password.hasError('required')).toBe(true);
    });

    it('is valid when every field satisfies its rules', () => {
      fillValidForm();
      expect(component.form.valid).toBe(true);
    });

    it('shows the error message in the DOM once a field is touched', () => {
      component.form.controls.email.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('El email es obligatorio.');
    });
  });

  describe('onSubmit', () => {
    it('does not attempt to log in when the form is invalid', () => {
      component.onSubmit();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('marks every field as touched when submitting an invalid form', () => {
      component.onSubmit();
      expect(component.form.controls.email.touched).toBe(true);
      expect(component.form.controls.password.touched).toBe(true);
    });

    it('navigates to the home page when the credentials are correct', () => {
      fillValidForm();
      component.onSubmit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('shows an error and does not navigate when the credentials are incorrect', () => {
      component.form.setValue({ email: usuario.email, password: 'wrongPassword' });
      component.onSubmit();

      expect(component.loginError).toBe(true);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('clears a previous login error once the credentials are correct', () => {
      component.form.setValue({ email: usuario.email, password: 'wrongPassword' });
      component.onSubmit();

      fillValidForm();
      component.onSubmit();

      expect(component.loginError).toBe(false);
    });
  });
});
