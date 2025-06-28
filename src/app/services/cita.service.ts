import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario';

export interface Cita {
  idCita: number;
  idPaciente: number;
  idMedico: number;
  idEspecialidad: number;
  fecha_hora: string;
  motivo: string;
  estado: string;
  paciente?: Usuario; // <-- Añadido para enriquecer la cita con datos del paciente
  historial?: any;    // <-- Opcional, para historial clínico si lo agregas después
}

@Injectable({
  providedIn: 'root'
})

export class CitaService {
  private apiUrl = 'http://localhost:5102/WeatherForecast'

  constructor(private http: HttpClient) { }

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/GetCita`)
  }
    insertarCita(cita: Cita): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/InsertarCita`, cita);
  }

  actualizarCita(cita: Cita): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/ActualizarCita`, cita);
  }

  eliminarCita(cita: Cita): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/EliminarCita`, { body: cita });
  }

  getCitasPorPaciente(idPaciente: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/GetCita`).pipe(
      map(citas => citas.filter(c => c.idPaciente === idPaciente))
    );
  }

}
