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
    // Campos extra para frontend (no existen en la BD, se rellenan con datos estáticos)
    telefono?: string;
    fechaNacimiento?: string;
    genero?: string;
    antecedentes?: string;
}
