import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submitted = false;
  loginError = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    this.submitted = true;
    this.loginError = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuario = this.authService.loginUsuario(this.form.getRawValue());

    if (!usuario) {
      this.loginError = true;
      return;
    }

    this.router.navigateByUrl('/');
  }
}
