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
}
