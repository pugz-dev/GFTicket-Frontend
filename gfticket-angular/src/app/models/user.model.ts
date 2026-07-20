export interface UserModel {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    telefono: string;
}

export interface Credenciales {
    email: string;
    password: string;
}