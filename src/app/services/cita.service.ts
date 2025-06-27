import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  idCita: number
  idPaciente: number
  idMedico: number
  idEspecialidad: number
  fecha_hora: string
  motivo: string
  estado: string
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

}
