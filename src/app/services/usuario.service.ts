import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) {}

  getUsuarioPorId(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/GetUsuarioPorId/${idUsuario}`);
  }

  actualizarUsuario(usuario: Usuario): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarUsuario`, usuario);
  }
}
