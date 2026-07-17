import { describe, it, expect } from 'vitest';
import { INITIAL_EVENTO, toEvento } from  './eventModel';

const dto = {
    id: 7,
    nombre: "Anochecer Sinfónico New",
    descripcion: "Disfruta de la novena sinfonía de Beethoven al aire libre.",
    fechaEvento: "2026-07-20",
    horaEvento: { hour: 21, minute: 30, second: 0, nano: 0 },
    precioMinimo: 15,
    precioMaximo: 45,
    localidad: "Barcelona",
    genero: "Clásica",
    nombreRecinto: "Parc del Forum",
    imagenUrl: "https://imagenes.ejemplo.com/sinfonico.jpg"
};

describe('toEvento' , () => {
    it('Empty dto defaults every field to the empty-form values', () =>{
        //Null-safe mapping: a partial/junk DTO must never leak null into the
        //components (the form calls .trim() on several fields)
        expect(toEvento({})).toEqual(INITIAL_EVENTO);
    });
  it('Simplifies horaEvento to an HH:mm string', () => {
    expect(toEvento(dto).horaEvento).toBe('21:30');
  });
  it('zero-pads hours and minutes', () => {
    const evento = toEvento({ ...dto, horaEvento: { hour: 9, minute: 5, second: 0, nano: 0 } });
    expect(evento.horaEvento).toBe('09:05');
  });

  it('tolerates horaEvento already being a string', () => {
    expect(toEvento({ ...dto, horaEvento: '20:30:00' }).horaEvento).toBe('20:30');
  });

  it('preserves the remaining fields unchanged', () => {
    const evento = toEvento(dto);
    expect(evento).toMatchObject({
      id: 7,
      nombre: 'Anochecer Sinfónico New',
      fechaEvento: '2026-07-20',
      precioMinimo: 15,
      precioMaximo: 45,
      nombreRecinto: 'Parc del Forum',
    });
  });
});

describe('INITIAL_EVENTO', () =>{
  it('Initial object values are defined but empty', () =>{
    const evento = INITIAL_EVENTO;
    expect(evento).toMatchObject({
      nombre: '',
      descripcion: '',
      fechaEvento: '',
      horaEvento: '',
      precioMinimo: '',
      precioMaximo: '',
      localidad: '',
      genero: '',
      nombreRecinto: '',
      imagenUrl: ''
    });
  })
});