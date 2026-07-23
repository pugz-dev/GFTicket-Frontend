import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserStorageService } from '../../services/user-storage.service';

const TELEFONO_PATTERN = /^[0-9]{9}$/;
const FOTO_MAX_BYTES = 2 * 1024 * 1024;

function noSoloEspaciosValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '') as string;
  return value.trim().length > 0 ? null : { soloEspacios: true };
}

function emailUnicoValidator(
  userStorageService: UserStorageService,
  idUsuarioActual: number,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = ((control.value ?? '') as string).trim().toLowerCase();
    const emailDuplicado = userStorageService
      .getUsuarios()
      .some((usuario) => usuario.id !== idUsuarioActual && usuario.email.toLowerCase() === email);

    return emailDuplicado ? { emailDuplicado: true } : null;
  };
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly userStorageService = inject(UserStorageService);

  submitted = false;
  guardadoOk = false;
  fotoPreview: string | null = null;
  fotoError = false;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), noSoloEspaciosValidator]],
    apellidos: ['', [Validators.required, Validators.minLength(2), noSoloEspaciosValidator]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(TELEFONO_PATTERN)]],
  });

  ngOnInit(): void {
    const usuario = this.authService.usuarioActual()!;

    this.form.controls.email.addValidators(emailUnicoValidator(this.userStorageService, usuario.id));

    this.form.setValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
    });

    this.fotoPreview = usuario.foto ?? null;
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (archivo.size > FOTO_MAX_BYTES) {
      this.fotoError = true;
      input.value = '';
      return;
    }

    this.fotoError = false;

    const lector = new FileReader();
    lector.onload = () => {
      this.fotoPreview = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  onSubmit(): void {
    this.submitted = true;
    this.guardadoOk = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuario = this.authService.usuarioActual()!;
    const { nombre, apellidos, email, telefono } = this.form.getRawValue();
    const actualizado = this.userStorageService.actualizarUsuario(usuario.id, {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      ...(this.fotoPreview ? { foto: this.fotoPreview } : {}),
    });

    if (actualizado) {
      this.authService.actualizarUsuarioActual(actualizado);
      this.guardadoOk = true;
    }
  }
}
