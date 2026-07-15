/**
 * @typedef {Object} EventoModel
 * @property {number} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {string} fechaEvento  - ISO date: "2026-07-14"
 * @property {string} horaEvento   - "HH:mm", e.g. "20:30"
 * @property {number} precioMinimo
 * @property {number} precioMaximo
 * @property {string} localidad
 * @property {string} genero
 * @property {string} nombreRecinto
 * @property {string} imagenUrl
 */

const pad = (n) => String(n ?? 0).padStart(2, '0');

/** Simplify the API's LocalTime object ({hour, minute, ...}) to "HH:mm". */
function toHoraEvento(hora) {
  if (!hora) return '';
  if (typeof hora === 'string') return hora.slice(0, 5); // consider "20:30:00" if the backend fixes serialization
  return `${pad(hora.hour)}:${pad(hora.minute)}`;
}

/** @returns {EventoModel} */
export function toEvento(dto) {
  return {
    id: dto.id,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    fechaEvento: dto.fechaEvento,
    horaEvento: toHoraEvento(dto.horaEvento),
    precioMinimo: dto.precioMinimo,
    precioMaximo: dto.precioMaximo,
    localidad: dto.localidad,
    genero: dto.genero,
    nombreRecinto: dto.nombreRecinto,
    imagenUrl: dto.imagenUrl,
  };
}

export const INITIAL_EVENTO = {
  nombre: '', descripcion: '', fechaEvento: '', horaEvento: '',
  precioMinimo: '', precioMaximo: '', localidad: '', genero: '',
  nombreRecinto: '', imagenUrl: '',
};


/* API response:
 {
    "id": 0,
    "nombre": "string",
    "descripcion": "string",
    "fechaEvento": "2026-07-14",
    "horaEvento": {
      "hour": 0,
      "minute": 0,
      "second": 0,
      "nano": 0
    },
    "precioMinimo": 0,
    "precioMaximo": 0,
    "localidad": "string",
    "genero": "string",
    "nombreRecinto": "string",
    "imagenUrl": "string"
  }
*/