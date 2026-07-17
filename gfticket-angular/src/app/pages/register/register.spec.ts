import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let router: Router;

  const usuarioValido = {
    nombre: 'Ana',
    apellidos: 'Garcia',
    email: 'ana@test.com',
    password: 'secret123',
    telefono: '611222333',
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component.form.setValue(usuarioValido);
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('validations', () => {
    it('marks nombre as required', () => {
      component.form.controls.nombre.setValue('');
      expect(component.form.controls.nombre.hasError('required')).toBe(true);
    });

    it('marks nombre invalid when shorter than 2 characters', () => {
      component.form.controls.nombre.setValue('A');
      expect(component.form.controls.nombre.hasError('minlength')).toBe(true);
    });

    it('marks apellidos as required', () => {
      component.form.controls.apellidos.setValue('');
      expect(component.form.controls.apellidos.hasError('required')).toBe(true);
    });

    it('marks apellidos invalid when shorter than 2 characters', () => {
      component.form.controls.apellidos.setValue('G');
      expect(component.form.controls.apellidos.hasError('minlength')).toBe(true);
    });

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

    it('marks password invalid when shorter than 8 characters', () => {
      component.form.controls.password.setValue('short');
      expect(component.form.controls.password.hasError('minlength')).toBe(true);
    });

    it('marks telefono as required', () => {
      component.form.controls.telefono.setValue('');
      expect(component.form.controls.telefono.hasError('required')).toBe(true);
    });

    it('marks telefono invalid when it does not have 9 digits', () => {
      component.form.controls.telefono.setValue('12345');
      expect(component.form.controls.telefono.hasError('pattern')).toBe(true);
    });

    it('is valid when every field satisfies its rules', () => {
      fillValidForm();
      expect(component.form.valid).toBe(true);
    });

    it('shows the error message in the DOM once a field is touched', () => {
      component.form.controls.nombre.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('El nombre es obligatorio.');
    });
  });

  describe('onSubmit', () => {
    it('does not persist anything when the form is invalid', () => {
      component.onSubmit();
      expect(localStorage.getItem('usuarios')).toBeNull();
    });

    it('marks every field as touched when submitting an invalid form', () => {
      component.onSubmit();
      expect(component.form.controls.nombre.touched).toBe(true);
      expect(component.form.controls.telefono.touched).toBe(true);
    });

    it('does not navigate away when the form is invalid', () => {
      component.onSubmit();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('persists the new user in localStorage when the form is valid', () => {
      fillValidForm();
      component.onSubmit();

      const usuariosCreados = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(usuariosCreados).toEqual([{ ...usuarioValido, id: 1 }]);
    });

    it('navigates to the home page once the user has been created', () => {
      fillValidForm();
      component.onSubmit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });
});
