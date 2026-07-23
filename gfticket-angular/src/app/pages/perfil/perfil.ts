import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserStorageService } from '../../services/user-storage.service';

const TELEFONO_PATTERN = /^[0-9]{9}$/;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userStorageService = inject(UserStorageService);

  submitted = false;
  guardadoOk = false;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(TELEFONO_PATTERN)]],
  });

  ngOnInit(): void {
    const usuario = this.authService.usuarioActual()!;

    this.form.setValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.guardadoOk = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuario = this.authService.usuarioActual()!;
    const actualizado = this.userStorageService.actualizarUsuario(usuario.id, this.form.getRawValue());

    if (actualizado) {
      this.authService.actualizarUsuarioActual(actualizado);
      this.guardadoOk = true;
    }
  }
}