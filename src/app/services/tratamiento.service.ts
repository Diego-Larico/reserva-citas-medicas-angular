import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tratamiento {
  idTratamiento?: number;
  idHistorial: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones: string;
}

@Injectable({ providedIn: 'root' })
export class TratamientoService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) {}

  crearTratamientos(tratamientos: Tratamiento[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/InsertarTratamientosLote`, tratamientos);
  }
}
