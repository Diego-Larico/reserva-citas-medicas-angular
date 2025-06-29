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
    activo?: boolean;
    estado_descripcion?: string;
    telefono?: string;
    fechaNacimiento?: string;
    genero?: string;
    antecedentes?: string;
}
