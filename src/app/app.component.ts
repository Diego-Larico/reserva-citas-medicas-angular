import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CitaService, Cita } from './services/cita.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'reserva-citas-medicas-angular';
  citas: Cita[] = [];

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.citas = data;
        console.log('Citas obtenidas:', data);
      },
      error: (error) => {
        console.error('Error al obtener citas:', error);
      }
    });
  }
}
