import { Component, OnInit } from '@angular/core';
import { CitaService, Cita } from '../../services/cita.service';

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.css'
})
export class CitaComponent implements OnInit{
  citas: Cita[] = [];

  constructor(private citaService: CitaService) { }

  ngOnInit(): void {
    this.citaService.getCitas().subscribe(data => {
      this.citas = data;
    });
  }
}
