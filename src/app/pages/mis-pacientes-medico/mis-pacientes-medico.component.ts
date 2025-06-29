import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-pacientes-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-pacientes-medico.component.html',
  styleUrl: './mis-pacientes-medico.component.css'
})
export class MisPacientesMedicoComponent implements OnInit {
  pacientes: Usuario[] = [];
  pacientesFiltrados: Usuario[] = [];
  pacienteSeleccionado: Usuario | null = null;
  citasRecientes: any[] = [];

  filtroNombre: string = '';
  filtroEstado: string = 'todos';
  cargando: boolean = false;

  resumenGeneral: any = {
    totalPacientes: 0,
    pacientesActivos: 0,
    citasEsteMes: 0,
    pacientesNuevos: 0
  };
  resumenProximasCitas: any = {
    hoy: 0,
    estaSemana: 0,
    proximos7Dias: 0,
    sinConfirmar: 0
  };
  pacientesFrecuentes: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private citaService: CitaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.cargando = true;
    const idMedico = localStorage.getItem('idUsuario');
    if (!idMedico) {
      this.cargando = false;
      console.warn('No se encontró idUsuario en localStorage');
      return;
    }
    this.citaService.getCitas().subscribe({
      next: (citas) => {
        console.log('Citas obtenidas:', citas);
        const citasMedico = citas.filter(c => c.idMedico === +idMedico);
        console.log('Citas del médico:', citasMedico);
        const pacientesIds = Array.from(new Set(citasMedico.map(c => c.idPaciente)));
        console.log('IDs de pacientes:', pacientesIds);
        if (pacientesIds.length === 0) {
          this.pacientes = [];
          this.pacientesFiltrados = [];
          this.resumenGeneral.totalPacientes = 0;
          this.cargando = false;
          return;
        }
        const pacientesTemp: Usuario[] = [];
        let completados = 0;
        pacientesIds.forEach(id => {
          this.usuarioService.getUsuarioPorId(id).subscribe({
            next: (paciente) => {
              pacientesTemp.push(paciente);
              completados++;
              if (completados === pacientesIds.length) {
                this.pacientes = pacientesTemp;
                this.pacientesFiltrados = [...this.pacientes];
                this.resumenGeneral.totalPacientes = this.pacientes.length;
                this.cargando = false;
                console.log('Pacientes encontrados:', this.pacientes);
              }
            },
            error: (err) => {
              completados++;
              console.warn('No se encontró el usuario con id', id, err);
              if (completados === pacientesIds.length) {
                this.pacientes = pacientesTemp;
                this.pacientesFiltrados = [...this.pacientes];
                this.resumenGeneral.totalPacientes = this.pacientes.length;
                this.cargando = false;
                console.log('Pacientes encontrados (con errores):', this.pacientes);
              }
            }
          });
        });
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al obtener citas:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.pacientesFiltrados = this.pacientes.filter(paciente => {
      const nombreCompleto = `${paciente.nombre} ${paciente.apPaterno} ${paciente.apMaterno}`.toLowerCase();
      const coincideNombre = nombreCompleto.includes(this.filtroNombre.toLowerCase());
      return coincideNombre;
    });
  }

  verHistorial(idPaciente: number): void {
    this.router.navigate(['/dashboard/historial', idPaciente]);
  }

  agendarCita(idPaciente: number): void {
    this.router.navigate(['/dashboard/nueva-cita'], { queryParams: { pacienteId: idPaciente } });
  }

  abrirModalDetalles(paciente: Usuario): void {
    this.pacienteSeleccionado = paciente;
    this.citaService.getCitasPorPaciente(paciente.idUsuario).subscribe({
      next: (citas) => {
        this.citasRecientes = citas;
      },
      error: () => {
        this.citasRecientes = [];
      }
    });
  }

  cerrarModal(): void {
    this.pacienteSeleccionado = null;
    this.citasRecientes = [];
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  enviarMensaje(idPaciente: number): void {
    // Implementa la lógica de mensajería aquí
    alert('Funcionalidad de mensajería no implementada.');
  }
}
