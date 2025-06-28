import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { MedicoService } from '../../services/medico.service';
import { CitaService, Cita } from '../../services/cita.service';
import { Usuario } from '../../models/usuario';
import Swal from 'sweetalert2';

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
    idEspecialidad: undefined,
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
    this.especialidadService.getEspecialidades().subscribe(data => {
      this.especialidades = data.filter(e => e.idEspecialidad !== 1);
    });
    this.medicoService.getMedicos().subscribe(data => {
      // Filtrar solo médicos (idRol 2)
      this.medicos = data.filter(m => m.idRol === 2);
      // Si ya hay una especialidad seleccionada, filtrar los médicos por esa especialidad
      this.cargarMedicos();
    });
  }

  cargarMedicos(): void {
    if (!this.nuevaCita.idEspecialidad) {
      this.medicosFiltrados = [];
      this.nuevaCita.idMedico = 0;
      return;
    }
    // Comparación numérica para evitar problemas de tipo
    this.medicosFiltrados = this.medicos.filter(m => Number(m.idEspecialidad) === Number(this.nuevaCita.idEspecialidad));
    this.nuevaCita.idMedico = 0;
    this.horariosDisponibles = [];
  }

  cargarHorariosDisponibles(): void {
    if (!this.fechaSeleccionada || !this.nuevaCita.idMedico) return;
    const horarios: {value: string, display: string}[] = [];
    const horaInicio = 9;
    const horaFin = 17;
    for (let h = horaInicio; h < horaFin; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hora = `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
        const fechaHora = `${this.fechaSeleccionada}T${hora}`;
        horarios.push({ value: fechaHora, display: hora });
      }
    }
    this.horariosDisponibles = horarios;
  }

  formularioValido(): boolean {
    return !!this.nuevaCita.idEspecialidad && !!this.nuevaCita.idMedico && !!this.nuevaCita.fecha_hora;
  }

  async agendarCita(): Promise<void> {
    if (!this.formularioValido()) {
      this.mensajeError = 'Por favor complete todos los campos obligatorios';
      return;
    }
    // Confirmación con SweetAlert2
    const result = await Swal.fire({
      title: '¿Confirmar cita?',
      text: '¿Desea agendar esta cita con los datos ingresados?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, agendar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      // Unir fecha y hora en un solo campo tipo datetime
      const fecha = this.fechaSeleccionada;
      const hora = this.nuevaCita.fecha_hora;
      const fechaHora = `${fecha}T${hora}`;
      const cita: Cita = {
        idCita: 0, // El backend lo ignora por ser identity
        idPaciente: this.nuevaCita.idPaciente!,
        idMedico: this.nuevaCita.idMedico!,
        idEspecialidad: this.nuevaCita.idEspecialidad!,
        fecha_hora: fechaHora,
        motivo: this.nuevaCita.motivo || '',
        estado: 'Pendiente'
      };
      this.citaService.insertarCita(cita).subscribe({
        next: () => {
          Swal.fire('Cita agendada', 'La cita fue registrada correctamente.', 'success');
          this.agendarOtraCita();
        },
        error: () => {
          Swal.fire('Error', 'Error al agendar la cita. Intente nuevamente.', 'error');
        }
      });
    }
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

  limpiarFormulario(): void {
    this.nuevaCita = {
      idPaciente: this.nuevaCita.idPaciente,
      idMedico: 0,
      idEspecialidad: undefined,
      fecha_hora: '',
      motivo: '',
      estado: 'Pendiente'
    };
    this.fechaSeleccionada = '';
    this.medicosFiltrados = [];
    this.horariosDisponibles = [];
    this.mensajeError = '';
  }

  getEspecialidadNombrePorId(id: number): string {
    const esp = this.especialidades.find(e => e.idEspecialidad === id);
    return esp ? esp.nombre : '';
  }
}
