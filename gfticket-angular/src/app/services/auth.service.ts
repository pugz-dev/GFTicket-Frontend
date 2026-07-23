import { inject, Injectable, signal } from '@angular/core';

import { Credenciales, UserModel } from '../models/user.model';
import { UserStorageService } from './user-storage.service';

const SESSION_KEY = 'sesionActual';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly userStorageService = inject(UserStorageService);

  private readonly usuarioActualSignal = signal<UserModel | null>(this.resolveUsuarioActual());
  readonly usuarioActual = this.usuarioActualSignal.asReadonly();

  loginUsuario(credenciales: Credenciales): UserModel | null {
    const email = credenciales.email.trim().toLowerCase();

    const usuario = this.userStorageService
      .getUsuarios()
      .find((u) => u.email.toLowerCase() === email && u.password === credenciales.password);

    if (usuario) {
      localStorage.setItem(SESSION_KEY, usuario.email);
      this.usuarioActualSignal.set(usuario);
    }

    return usuario ?? null;
  }

  actualizarUsuarioActual(usuario: UserModel): void {
    this.usuarioActualSignal.set(usuario);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.usuarioActualSignal.set(null);
  }

  estaAutenticado(): boolean {
    return this.usuarioActualSignal() !== null;
  }

  private resolveUsuarioActual(): UserModel | null {
    const email = localStorage.getItem(SESSION_KEY);

    if (!email) {
      return null;
    }

    return this.userStorageService.getUsuarios().find((u) => u.email === email) ?? null;
  }
}
