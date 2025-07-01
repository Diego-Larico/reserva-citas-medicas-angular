import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/GetUsuario`);
  }

  getUsuarioPorId(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/GetUsuarioPorId/${idUsuario}`);
  }

  crearUsuario(usuario: Usuario): Observable<boolean> {
    // Asegurarse de enviar todos los campos requeridos, incluyendo 'activo'
    return this.http.post<boolean>(`${this.apiUrl}/InsertarUsuario`, usuario);
  }

  actualizarUsuario(usuario: Usuario): Observable<boolean> {
    // Asegurarse de enviar todos los campos requeridos, incluyendo 'activo'
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarUsuario`, usuario);
  }

  eliminarUsuario(idUsuario: number): Observable<boolean> {
    // Eliminar por id, se envía el objeto usuario con solo el id
    return this.http.delete<boolean>(`${this.apiUrl}/EliminarUsuario`, { body: { idUsuario } });
  }

  cambiarEstadoUsuario(idUsuario: number, activo: boolean): Observable<boolean> {
    // Usar el endpoint específico para cambiar estado
    return this.http.put<boolean>(`${this.apiUrl}/CambiarEstadoUsuario`, { idUsuario, activo });
  }

  // Recuperación de contraseña
  enviarCodigoRecuperacion(email: string): Observable<boolean> {
    // Llama al endpoint que envía el código al correo
    return this.http.post<boolean>(`${this.apiUrl}/EnviarCodigoRecuperacion`, { email });
  }

  validarCodigoRecuperacion(email: string, codigo: string): Observable<boolean> {
    // Llama al endpoint que valida el código
    return this.http.post<boolean>(`${this.apiUrl}/ValidarCodigoRecuperacion`, { email, codigo });
  }

  actualizarPasswordPorEmail(email: string, nuevaPassword: string): Observable<boolean> {
    // Llama al endpoint que actualiza la contraseña por email
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarPasswordPorEmail`, { email, password: nuevaPassword });
  }
}
