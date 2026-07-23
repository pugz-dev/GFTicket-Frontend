import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UserStorageService } from '../../services/user-storage.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena {
  private readonly fb = inject(FormBuilder);
  private readonly userStorageService = inject(UserStorageService);

  submitted = false;
  contrasenaEncontrada: string | null = null;
  noEncontrado = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    this.submitted = true;
    this.contrasenaEncontrada = null;
    this.noEncontrado = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    const contrasena = this.userStorageService.recuperarContrasena(email);

    if (contrasena) {
      this.contrasenaEncontrada = contrasena;
    } else {
      this.noEncontrado = true;
    }
  }
}
