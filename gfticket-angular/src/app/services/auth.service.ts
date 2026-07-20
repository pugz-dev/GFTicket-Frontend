import { inject, Injectable } from '@angular/core';

import { Credenciales, UserModel } from '../models/user.model';
import { UserStorageService } from './user-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly userStorageService = inject(UserStorageService);

  loginUsuario(credenciales: Credenciales): UserModel | null {
    const email = credenciales.email.trim().toLowerCase();

    const usuario = this.userStorageService
      .getUsuarios()
      .find((u) => u.email.toLowerCase() === email && u.password === credenciales.password);

    return usuario ?? null;
  }
}
