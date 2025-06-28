export interface Usuario {
    idUsuario: number;
    apPaterno: string;
    apMaterno: string;
    nombre: string;
    usuario: string;
    email: string;
    password: string;
    idRol: number;
    idEspecialidad: number;
    rol?: { idRol: number; nombre: string };
}
