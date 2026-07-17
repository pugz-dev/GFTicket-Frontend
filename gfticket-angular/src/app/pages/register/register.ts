import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserStorageService } from '../../services/user-storage.service';

const TELEFONO_PATTERN = /^[0-9]{9}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly userStorageService = inject(UserStorageService);
  private readonly router = inject(Router);

  submitted = false;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', [Validators.required, Validators.pattern(TELEFONO_PATTERN)]],
  });

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.userStorageService.registrarUsuario(this.form.getRawValue());
    this.router.navigateByUrl('/');
  }
}