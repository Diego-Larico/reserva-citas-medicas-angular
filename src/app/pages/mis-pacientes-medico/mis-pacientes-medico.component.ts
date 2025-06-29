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
        // Filtrar solo citas del médico logueado
        const citasMedico = citas.filter(c => c.idMedico === +idMedico);
        this.citasRecientes = citasMedico;
        // Calcular resumen de próximas citas
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6); // Sábado
        const dentro7dias = new Date(hoy);
        dentro7dias.setDate(hoy.getDate() + 7);
        this.resumenProximasCitas = {
          hoy: citasMedico.filter(c => {
            const f = new Date(c.fecha_hora);
            return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
          }).length,
          estaSemana: citasMedico.filter(c => {
            const f = new Date(c.fecha_hora);
            return f >= inicioSemana && f <= finSemana;
          }).length,
          proximos7Dias: citasMedico.filter(c => {
            const f = new Date(c.fecha_hora);
            return f > hoy && f <= dentro7dias;
          }).length,
          sinConfirmar: citasMedico.filter(c => c.estado && c.estado.toLowerCase() === 'sin confirmar').length
        };
        // Calcular resumen general
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        this.resumenGeneral = {
          totalPacientes: Array.from(new Set(citasMedico.map(c => c.idPaciente))).length,
          pacientesActivos: Array.from(new Set(citasMedico.filter(c => new Date(c.fecha_hora) >= hoy).map(c => c.idPaciente))).length,
          citasEsteMes: citasMedico.filter(c => {
            const f = new Date(c.fecha_hora);
            return f.getMonth() === mesActual && f.getFullYear() === anioActual;
          }).length,
          pacientesNuevos: Array.from(new Set(citasMedico.filter(c => {
            const f = new Date(c.fecha_hora);
            return f.getMonth() === mesActual && f.getFullYear() === anioActual;
          }).map(c => c.idPaciente))).length
        };
        const pacientesIds = Array.from(new Set(citasMedico.map(c => c.idPaciente)));
        if (pacientesIds.length === 0) {
          this.pacientes = [];
          this.pacientesFiltrados = [];
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
                this.cargando = false;
              }
            },
            error: (err) => {
              completados++;
              if (completados === pacientesIds.length) {
                this.pacientes = pacientesTemp;
                this.pacientesFiltrados = [...this.pacientes];
                this.cargando = false;
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
    // Filtrado por nombre
    let filtrados = this.pacientes.filter(p => {
      const nombreCompleto = `${p.nombre} ${p.apPaterno} ${p.apMaterno}`.toLowerCase();
      return nombreCompleto.includes(this.filtroNombre.toLowerCase());
    });

    // Filtrado por estado
    if (this.filtroEstado === 'conCitas') {
      const ahora = new Date();
      filtrados = filtrados.filter(paciente => {
        // Buscar si el paciente tiene al menos una cita futura con el médico logueado
        return this.citasRecientes.some(cita =>
          cita.idPaciente === paciente.idUsuario && new Date(cita.fecha_hora) > ahora
        );
      });
    }

    this.pacientesFiltrados = filtrados;
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroEstado = 'todos';
    this.aplicarFiltros();
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
