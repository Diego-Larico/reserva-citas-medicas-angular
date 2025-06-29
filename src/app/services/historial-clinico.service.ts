import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface HistorialClinico {
  idHistorial?: number;
  idCita: number;
  idMedico: number;
  diagnosticoPrincipal: string;
  codigoCie: string;
  notasMedicas: string;
  fechaCreacion?: string;
}

@Injectable({ providedIn: 'root' })
export class HistorialClinicoService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) {}

  crearHistorial(historial: HistorialClinico): Observable<HistorialClinico> {
    return this.http.post<HistorialClinico>(this.apiUrl, historial);
  }

  // Obtener todos los historiales y filtrar por médico
    obtenerHistorialesPorMedico(idMedico: number) {
    return this.http.get<any[]>(`${this.apiUrl}/GetHistorialClinico`).pipe(
        map(historiales => historiales.filter(h => h.idMedico === idMedico))
    );
}
}
