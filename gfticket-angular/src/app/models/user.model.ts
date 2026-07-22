import { TicketModel } from "./ticket.model";

export interface UserModel {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    telefono: string;
    entradas?: TicketModel[];
}

export interface Credenciales {
    email: string;
    password: string;
}