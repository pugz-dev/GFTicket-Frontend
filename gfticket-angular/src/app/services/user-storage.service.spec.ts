import { TestBed } from '@angular/core/testing';

import { UserModel } from '../models/user.model';
import { TicketModel } from '../models/ticket.model';
import { UserStorageService } from './user-storage.service';

describe('UserStorageService', () => {
  let service: UserStorageService;

  const nuevoUsuario: Omit<UserModel, 'id'> = {
    nombre: 'Ana',
    apellidos: 'Garcia',
    email: 'ana@test.com',
    password: 'secret123',
    telefono: '600111222',
  };

  const entrada: TicketModel = {
    eventId: 1,
    nombreEvento: 'Concierto de prueba',
    fecha: '2026-07-22',
    fechaEvento: '2026-08-15',
    precioPagado: 30,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStorageService);
  });

  describe('getUsuarios', () => {
    it('returns an empty array when localStorage has never been initialized', () => {
      expect(service.getUsuarios()).toEqual([]);
    });

    it('returns the users parsed from localStorage', () => {
      localStorage.setItem('usuarios', JSON.stringify([{ ...nuevoUsuario, id: 1 }]));

      expect(service.getUsuarios()).toEqual([{ ...nuevoUsuario, id: 1 }]);
    });
  });

  it('stores the new user under the "usuarios" key in localStorage', () => {
    service.registrarUsuario(nuevoUsuario);

    const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
    expect(stored).toEqual([{ ...nuevoUsuario, id: 1 }]);
  });

  it('returns the created user with a generated id', () => {
    const result = service.registrarUsuario(nuevoUsuario);

    expect(result).toEqual({ ...nuevoUsuario, id: 1 });
  });

  it('appends to existing users instead of overwriting them', () => {
    service.registrarUsuario(nuevoUsuario);
    service.registrarUsuario({ ...nuevoUsuario, email: 'otro@test.com' });

    const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
    expect(stored).toHaveLength(2);
  });

  it('assigns incremental ids based on the highest existing id', () => {
    service.registrarUsuario(nuevoUsuario);
    const second = service.registrarUsuario({ ...nuevoUsuario, email: 'otro@test.com' });

    expect(second.id).toBe(2);
  });

  it('assigns the next id based on the highest id even with gaps', () => {
    localStorage.setItem(
      'usuarios',
      JSON.stringify([
        { ...nuevoUsuario, id: 1 },
        { ...nuevoUsuario, id: 5 },
      ]),
    );

    const result = service.registrarUsuario(nuevoUsuario);

    expect(result.id).toBe(6);
  });

  describe('sembrarUsuariosPrueba', () => {
    it('seeds test users when localStorage has never been initialized', () => {
      service.sembrarUsuariosPrueba();

      const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored.length).toBeGreaterThan(0);
    });

    it('does not overwrite existing users on subsequent app starts', () => {
      service.registrarUsuario(nuevoUsuario);

      service.sembrarUsuariosPrueba();

      const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored).toEqual([{ ...nuevoUsuario, id: 1 }]);
    });

    it('does not reseed once the users list has been emptied', () => {
      localStorage.setItem('usuarios', JSON.stringify([]));

      service.sembrarUsuariosPrueba();

      const stored = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored).toEqual([]);
    });
  });

  describe('recuperarContrasena', () => {
    it('returns the password when the email matches a registered user', () => {
      service.registrarUsuario(nuevoUsuario);

      const result = service.recuperarContrasena(nuevoUsuario.email);

      expect(result).toBe(nuevoUsuario.password);
    });

    it('matches the email case-insensitively', () => {
      service.registrarUsuario(nuevoUsuario);

      const result = service.recuperarContrasena('ANA@TEST.COM');

      expect(result).toBe(nuevoUsuario.password);
    });

    it('ignores surrounding whitespace in the email', () => {
      service.registrarUsuario(nuevoUsuario);

      const result = service.recuperarContrasena('  ana@test.com  ');

      expect(result).toBe(nuevoUsuario.password);
    });

    it('returns null when no user matches the given email', () => {
      const result = service.recuperarContrasena('noexiste@test.com');

      expect(result).toBeNull();
    });

    it('returns null when there are no users stored', () => {
      const result = service.recuperarContrasena(nuevoUsuario.email);

      expect(result).toBeNull();
    });
  });

  describe('actualizarUsuario', () => {
    it('updates the given fields and persists them in localStorage', () => {
      const creado = service.registrarUsuario(nuevoUsuario);

      service.actualizarUsuario(creado.id, { nombre: 'Ana Maria', telefono: '699888777' });

      const stored: UserModel[] = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored[0]).toEqual({
        ...nuevoUsuario,
        id: creado.id,
        nombre: 'Ana Maria',
        telefono: '699888777',
      });
    });

    it('returns the updated user', () => {
      const creado = service.registrarUsuario(nuevoUsuario);

      const result = service.actualizarUsuario(creado.id, { nombre: 'Ana Maria' });

      expect(result).toEqual({ ...nuevoUsuario, id: creado.id, nombre: 'Ana Maria' });
    });

    it('returns null when no user matches the given id', () => {
      const result = service.actualizarUsuario(999, { nombre: 'Ana Maria' });

      expect(result).toBeNull();
    });

    it('does not affect other users in storage', () => {
      const primero = service.registrarUsuario(nuevoUsuario);
      const segundo = service.registrarUsuario({ ...nuevoUsuario, email: 'otro@test.com' });

      service.actualizarUsuario(primero.id, { nombre: 'Ana Maria' });

      const stored: UserModel[] = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored.find((u) => u.id === segundo.id)?.nombre).toBe(nuevoUsuario.nombre);
    });
  });

  describe('asociarEntrada', () => {
    it('adds the ticket to the entradas list when the user has none yet', () => {
      service.registrarUsuario(nuevoUsuario);

      service.asociarEntrada(nuevoUsuario.email, entrada);

      const stored: UserModel[] = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored[0].entradas).toEqual([entrada]);
    });

    it('appends to the existing entradas instead of overwriting them', () => {
      service.registrarUsuario(nuevoUsuario);
      const otraEntrada: TicketModel = { ...entrada, eventId: 2, nombreEvento: 'Otro evento' };

      service.asociarEntrada(nuevoUsuario.email, entrada);
      service.asociarEntrada(nuevoUsuario.email, otraEntrada);

      const stored: UserModel[] = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored[0].entradas).toEqual([entrada, otraEntrada]);
    });

    it('does not affect other users in storage', () => {
      service.registrarUsuario(nuevoUsuario);
      service.registrarUsuario({ ...nuevoUsuario, email: 'otro@test.com' });

      service.asociarEntrada(nuevoUsuario.email, entrada);

      const stored: UserModel[] = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored.find((u) => u.email === 'otro@test.com')?.entradas).toBeUndefined();
    });

    it('does not modify the stored users when the email does not match any user', () => {
      service.registrarUsuario(nuevoUsuario);

      service.asociarEntrada('noexiste@test.com', entrada);

      const stored: UserModel[] = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
      expect(stored).toEqual([{ ...nuevoUsuario, id: 1 }]);
    });
  });
});