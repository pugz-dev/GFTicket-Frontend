import { Injectable } from '@angular/core';

import { UserModel } from '../models/user.model';

const STORAGE_KEY = 'usuarios';

const USUARIOS_PRUEBA: UserModel[] = [
  {
    id: 1,
    nombre: 'Juan',
    apellidos: 'Perez',
    email: 'juan.perez@test.com',
    password: 'Test1234',
    telefono: '611222333',
  },
  {
    id: 2,
    nombre: 'Maria',
    apellidos: 'Lopez',
    email: 'maria.lopez@test.com',
    password: 'Test1234',
    telefono: '622333444',
  },
];

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  sembrarUsuariosPrueba(): void {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PRUEBA));
    }
  }

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

  getUsuarios(): UserModel[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private getNextId(usuarios: UserModel[]): number {
    return usuarios.reduce((maxId, usuario) => Math.max(maxId, usuario.id), 0) + 1;
  }
}