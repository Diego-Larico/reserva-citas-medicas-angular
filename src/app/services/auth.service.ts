import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5102/WeatherForecast';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<Usuario> {
    const body = { email, password };
    return this.http.post<Usuario>(`${this.apiUrl}/Login`, body);
  }
}
