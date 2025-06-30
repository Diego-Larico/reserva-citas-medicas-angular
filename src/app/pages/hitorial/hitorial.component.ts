import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService, Cita } from '../../services/cita.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { HistorialClinicoService, HistorialClinico } from '../../services/historial-clinico.service';

interface RegistroMedico {
  id: number;
  tipo: 'consulta' | 'procedimiento' | 'examen';
  titulo: string;
  fecha: Date;
  medico?: {
    nombre: string;
    apPaterno: string;
    apMaterno: string;
  };
  especialidad?: {
    idEspecialidad: number;
    nombre: string;
  };
  diagnostico?: string;
  tratamiento?: string;
  notas?: string;
  archivos?: {
    nombre: string;
    tipo: 'pdf' | 'imagen' | 'documento';
  }[];
}

@Component({
  selector: 'app-hitorial',
  templateUrl: './hitorial.component.html',
  styleUrl: './hitorial.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HitorialComponent implements OnInit {
  filtroAnio: string = 'todos';
  filtroEspecialidad: string = 'todas';
  filtroTipo: string = 'todos';
  registros: RegistroMedico[] = [];
  registrosFiltrados: RegistroMedico[] = [];
  especialidades: Especialidad[] = [];
  aniosDisponibles: number[] = [];
  usuario: Usuario | null = null;
  medicos: Usuario[] = [];

  constructor(
    private citaService: CitaService,
    private especialidadService: EspecialidadService,
    private usuarioService: UsuarioService,
    private historialClinicoService: HistorialClinicoService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
    }
    this.cargarEspecialidades();
    this.cargarMedicos();
  }

  cargarEspecialidades(): void {
    this.especialidadService.getEspecialidades().subscribe(data => {
      // Filtrar especialidades para no mostrar 'sin_especialidad'
      this.especialidades = data.filter(e => e.nombre.toLowerCase() !== 'sin_especialidad');
      this.cargarRegistros();
    });
  }

  cargarMedicos(): void {
    this.usuarioService.getUsuarios().subscribe(data => {
      this.medicos = data.filter(u => u.idRol === 2);
    });
  }

  cargarRegistros(): void {
    if (!this.usuario) return;
    this.citaService.getCitasPorPaciente(this.usuario.idUsuario).subscribe(citas => {
      // Filtrar solo las citas completadas
      const citasCompletadas = citas.filter(c => c.estado && c.estado.toLowerCase() === 'completada');
      this.historialClinicoService
        .getHistorialesPorCitas(citasCompletadas.map(c => c.idCita))
        .subscribe(historiales => {
          this.registros = citasCompletadas.map(cita => {
            const especialidad = this.especialidades.find(e => e.idEspecialidad === cita.idEspecialidad);
            const medico = this.medicos.find(m => m.idUsuario === cita.idMedico);
            const historial = historiales.find(h => h.idCita === cita.idCita);
            return {
              id: cita.idCita,
              tipo: 'consulta',
              titulo: cita.motivo || 'Consulta médica',
              fecha: new Date(cita.fecha_hora),
              medico: medico ? { nombre: medico.nombre, apPaterno: medico.apPaterno, apMaterno: medico.apMaterno } : undefined,
              especialidad: especialidad ? { idEspecialidad: especialidad.idEspecialidad, nombre: especialidad.nombre } : undefined,
              diagnostico: historial ? historial.diagnosticoPrincipal : '',
              tratamiento: '',
              notas: historial ? historial.notasMedicas : '',
              archivos: []
            };
          });
          this.aniosDisponibles = [...new Set(this.registros.map(r => r.fecha.getFullYear()))].sort((a, b) => b - a);
          this.aplicarFiltros();
        });
    });
  }

  aplicarFiltros(): void {
    this.registrosFiltrados = this.registros.filter(registro => {
      const cumpleAnio = this.filtroAnio === 'todos' || registro.fecha.getFullYear().toString() === this.filtroAnio;
      const cumpleEspecialidad = this.filtroEspecialidad === 'todas' || (registro.especialidad && registro.especialidad.idEspecialidad === +this.filtroEspecialidad);
      const cumpleTipo = this.filtroTipo === 'todos' || registro.tipo === this.filtroTipo;
      return cumpleAnio && cumpleEspecialidad && cumpleTipo;
    }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  getTipoDisplay(tipo: string): string {
    switch(tipo) {
      case 'consulta': return 'Consulta';
      case 'procedimiento': return 'Procedimiento';
      case 'examen': return 'Examen';
      default: return tipo;
    }
  }
}
