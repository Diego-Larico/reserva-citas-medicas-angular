import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { MedicoService } from '../../services/medico.service';
import { CitaService, Cita } from '../../services/cita.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-nueva-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-cita.component.html',
  styleUrl: './nueva-cita.component.css'
})
export class NuevaCitaComponent implements OnInit {
  nuevaCita: Partial<Cita> = {
    idPaciente: 0,
    idMedico: 0,
    idEspecialidad: 0,
    fecha_hora: '',
    motivo: '',
    estado: 'Pendiente'
  };
  fechaSeleccionada: string = '';
  fechaActual: string = new Date().toISOString().split('T')[0];
  especialidades: Especialidad[] = [];
  medicos: Usuario[] = [];
  medicosFiltrados: Usuario[] = [];
  horariosDisponibles: {value: string, display: string}[] = [];
  mostrarModalConfirmacion: boolean = false;
  citaConfirmada: any = {};
  mensajeError: string = '';

  constructor(
    private router: Router,
    private especialidadService: EspecialidadService,
    private medicoService: MedicoService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      const user = JSON.parse(userData);
      this.nuevaCita.idPaciente = user.idUsuario;
    }
    this.especialidadService.getEspecialidades().subscribe(data => this.especialidades = data);
    this.medicoService.getMedicos().subscribe(data => this.medicos = data);
  }

  cargarMedicos(): void {
    this.medicosFiltrados = this.medicos.filter(m => m.idEspecialidad === this.nuevaCita.idEspecialidad);
    this.nuevaCita.idMedico = 0;
    this.horariosDisponibles = [];
  }

  cargarHorariosDisponibles(): void {
    if (!this.fechaSeleccionada || !this.nuevaCita.idMedico) return;
    // Aquí deberías consultar horarios reales si tienes endpoint, por ahora simula slots
    const horarios: {value: string, display: string}[] = [];
    const horaInicio = 9;
    const horaFin = 17;
    for (let h = horaInicio; h < horaFin; h++) {
      ['00', '30'].forEach(m => {
        const hora = `${h.toString().padStart(2, '0')}:${m}`;
        const fechaHora = `${this.fechaSeleccionada}T${hora}`;
        horarios.push({ value: fechaHora, display: hora });
      });
    }
    this.horariosDisponibles = horarios;
  }

  formularioValido(): boolean {
    return !!this.nuevaCita.idEspecialidad && !!this.nuevaCita.idMedico && !!this.nuevaCita.fecha_hora;
  }

  agendarCita(): void {
    if (!this.formularioValido()) {
      this.mensajeError = 'Por favor complete todos los campos obligatorios';
      return;
    }
    this.citaService.insertarCita(this.nuevaCita as Cita).subscribe({
      next: () => {
        this.citaConfirmada = {
          ...this.nuevaCita,
          especialidad: this.especialidades.find(e => e.idEspecialidad === this.nuevaCita.idEspecialidad),
          medico: this.medicos.find(m => m.idUsuario === this.nuevaCita.idMedico)
        };
        this.mostrarModalConfirmacion = true;
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeError = 'Error al agendar la cita. Intente nuevamente.';
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModalConfirmacion = false;
  }

  irAMisCitas(): void {
    this.router.navigate(['/dashboard/citas']);
  }

  agendarOtraCita(): void {
    this.mostrarModalConfirmacion = false;
    this.nuevaCita = {
      idPaciente: this.nuevaCita.idPaciente,
      idMedico: 0,
      idEspecialidad: 0,
      fecha_hora: '',
      motivo: '',
      estado: 'Pendiente'
    };
    this.fechaSeleccionada = '';
    this.medicosFiltrados = [];
    this.horariosDisponibles = [];
  }

  getEspecialidadNombrePorId(id: number): string {
    const esp = this.especialidades.find(e => e.idEspecialidad === id);
    return esp ? esp.nombre : '';
  }
}
