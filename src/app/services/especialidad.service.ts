import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) {}

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}/GetEspecialidad`);
  }

  crearEspecialidad(especialidad: Especialidad): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/InsertarEspecialidad`, especialidad);
  }

  actualizarEspecialidad(idEspecialidad: number, especialidad: Partial<Especialidad>): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarEspecialidad`, { idEspecialidad, ...especialidad });
  }

  eliminarEspecialidad(idEspecialidad: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/EliminarEspecialidad`, { body: { idEspecialidad } });
  }
}
