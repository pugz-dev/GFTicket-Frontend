import { TestBed } from '@angular/core/testing';

import { UserModel } from '../models/user.model';
import { UserStorageService } from './user-storage.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userStorageService: UserStorageService;

  const usuario: Omit<UserModel, 'id'> = {
    nombre: 'Ana',
    apellidos: 'Garcia',
    email: 'ana@test.com',
    password: 'secret123',
    telefono: '600111222',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    userStorageService = TestBed.inject(UserStorageService);

    userStorageService.registrarUsuario(usuario);
  });

  it('returns the matching user when the credentials are correct', () => {
    const result = service.loginUsuario({ email: usuario.email, password: usuario.password });

    expect(result).toEqual({ ...usuario, id: 1 });
  });

  it('matches the email case-insensitively', () => {
    const result = service.loginUsuario({ email: 'ANA@TEST.COM', password: usuario.password });

    expect(result).toEqual({ ...usuario, id: 1 });
  });

  it('ignores surrounding whitespace in the email', () => {
    const result = service.loginUsuario({ email: '  ana@test.com  ', password: usuario.password });

    expect(result).toEqual({ ...usuario, id: 1 });
  });

  it('returns null when the password is incorrect', () => {
    const result = service.loginUsuario({ email: usuario.email, password: 'wrongPassword' });

    expect(result).toBeNull();
  });

  it('returns null when the email does not exist', () => {
    const result = service.loginUsuario({ email: 'noexiste@test.com', password: usuario.password });

    expect(result).toBeNull();
  });

  it('returns null when there are no users stored', () => {
    localStorage.clear();

    const result = service.loginUsuario({ email: usuario.email, password: usuario.password });

    expect(result).toBeNull();
  });

  describe('estaAutenticado', () => {
    it('returns false when there is no active session', () => {
      expect(service.estaAutenticado()).toBe(false);
    });

    it('returns true after a successful login', () => {
      service.loginUsuario({ email: usuario.email, password: usuario.password });

      expect(service.estaAutenticado()).toBe(true);
    });

    it('remains false after a failed login', () => {
      service.loginUsuario({ email: usuario.email, password: 'wrongPassword' });

      expect(service.estaAutenticado()).toBe(false);
    });
  });

  describe('usuarioActual', () => {
    it('is null when there is no active session', () => {
      expect(service.usuarioActual()).toBeNull();
    });

    it('holds the logged in user after a successful login', () => {
      service.loginUsuario({ email: usuario.email, password: usuario.password });

      expect(service.usuarioActual()).toEqual({ ...usuario, id: 1 });
    });

    it('is restored from an existing session when the service is created', () => {
      localStorage.setItem('sesionActual', usuario.email);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const freshService = TestBed.inject(AuthService);

      expect(freshService.usuarioActual()).toEqual({ ...usuario, id: 1 });
    });
  });

  describe('logout', () => {
    it('clears the active session', () => {
      service.loginUsuario({ email: usuario.email, password: usuario.password });

      service.logout();

      expect(service.estaAutenticado()).toBe(false);
      expect(service.usuarioActual()).toBeNull();
      expect(localStorage.getItem('sesionActual')).toBeNull();
    });
  });
});
