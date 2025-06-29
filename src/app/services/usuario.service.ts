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
    return this.http.post<boolean>(`${this.apiUrl}/InsertarUsuario`, usuario);
  }

  actualizarUsuario(usuario: Usuario): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarUsuario`, usuario);
  }

  eliminarUsuario(idUsuario: number): Observable<boolean> {
    // Eliminar por id, se envía el objeto usuario con solo el id
    return this.http.delete<boolean>(`${this.apiUrl}/EliminarUsuario`, { body: { idUsuario } });
  }

  cambiarEstadoUsuario(idUsuario: number, activo: boolean): Observable<boolean> {
    // Simula el cambio de estado enviando el usuario con el nuevo estado
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarUsuario`, { idUsuario, activo });
  }
}
