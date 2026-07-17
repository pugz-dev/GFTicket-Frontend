import { Injectable } from '@angular/core';

import { UserModel } from '../models/user.model';

const STORAGE_KEY = 'usuarios';

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  registrarUsuario(usuario: Omit<UserModel, 'id'>): UserModel {
    const usuarios = this.getUsuarios();
    const nuevoUsuario: UserModel = {
      ...usuario,
      id: this.getNextId(usuarios),
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

    return nuevoUsuario;
  }

  private getUsuarios(): UserModel[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private getNextId(usuarios: UserModel[]): number {
    return usuarios.reduce((maxId, usuario) => Math.max(maxId, usuario.id), 0) + 1;
  }
}