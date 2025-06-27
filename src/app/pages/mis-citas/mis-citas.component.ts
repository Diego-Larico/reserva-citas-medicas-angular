import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService, Cita } from '../../services/cita.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { MedicoService } from '../../services/medico.service';
import { Usuario } from '../../models/usuario';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MisCitasComponent implements OnInit {
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  filtroEstado: string = 'todas';
  filtroFecha: string = '';
  citaSeleccionada: Cita | null = null;
  usuario: Usuario | null = null;
  especialidades: Especialidad[] = [];
  medicos: Usuario[] = [];

  constructor(
    private citaService: CitaService,
    private especialidadService: EspecialidadService,
    private medicoService: MedicoService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
    }
    this.citaService.getCitas().subscribe((citas) => {
      // Filtrar solo las citas del usuario logueado
      this.citas = citas.filter(c => c.idPaciente === this.usuario?.idUsuario);
      this.citasFiltradas = [...this.citas];
    });
    this.especialidadService.getEspecialidades().subscribe(data => this.especialidades = data);
    this.medicoService.getMedicos().subscribe(data => this.medicos = data);
  }

  getEspecialidadNombre(id: number): string {
    return this.especialidades.find(e => e.idEspecialidad === id)?.nombre || 'Especialidad';
  }

  getMedicoNombre(id: number): string {
    const medico = this.medicos.find(m => m.idUsuario === id);
    return medico ? `${medico.nombre} ${medico.apPaterno}` : 'Médico';
  }

  aplicarFiltros() {
    this.citasFiltradas = this.citas.filter(cita => {
      const estadoOk = this.filtroEstado === 'todas' || cita.estado === this.filtroEstado;
      const fechaOk = !this.filtroFecha || cita.fecha_hora.startsWith(this.filtroFecha);
      return estadoOk && fechaOk;
    });
  }

  confirmarCita(idCita: number) {
    // Implementar lógica de confirmación
  }

  cancelarCita(idCita: number) {
    // Implementar lógica de cancelación
  }

  verDetalleCita(cita: Cita) {
    this.citaSeleccionada = cita;
  }

  cerrarModal() {
    this.citaSeleccionada = null;
  }
}
