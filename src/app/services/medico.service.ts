import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) {}

  getMedicos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/GetUsuario`);
  }
}
