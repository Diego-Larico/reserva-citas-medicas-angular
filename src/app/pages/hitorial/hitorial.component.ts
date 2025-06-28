import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

interface Especialidad {
  idEspecialidad: number;
  nombre: string;
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

  constructor() {}

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarRegistros();
  }

  cargarEspecialidades(): void {
    this.especialidades = [
      { idEspecialidad: 1, nombre: 'Cardiología' },
      { idEspecialidad: 2, nombre: 'Dermatología' },
      { idEspecialidad: 3, nombre: 'Pediatría' },
      { idEspecialidad: 4, nombre: 'Oftalmología' },
      { idEspecialidad: 5, nombre: 'Ginecología' },
      { idEspecialidad: 6, nombre: 'Neurología' }
    ];
  }

  cargarRegistros(): void {
    this.registros = [
      {
        id: 1,
        tipo: 'consulta',
        titulo: 'Consulta de rutina',
        fecha: new Date('2023-05-15'),
        medico: { nombre: 'Carlos', apPaterno: 'Mendoza', apMaterno: 'López' },
        especialidad: { idEspecialidad: 1, nombre: 'Cardiología' },
        diagnostico: 'Hipertensión arterial controlada',
        tratamiento: 'Continuar con medicación actual y dieta baja en sodio',
        notas: 'Paciente reporta mejoría en síntomas. Presión arterial 120/80 mmHg.',
        archivos: [
          { nombre: 'Informe_consulta.pdf', tipo: 'pdf' },
          { nombre: 'Electrocardiograma.png', tipo: 'imagen' }
        ]
      },
      {
        id: 2,
        tipo: 'procedimiento',
        titulo: 'Extracción de lunar',
        fecha: new Date('2023-03-22'),
        medico: { nombre: 'Laura', apPaterno: 'Fernández', apMaterno: 'Gómez' },
        especialidad: { idEspecialidad: 2, nombre: 'Dermatología' },
        diagnostico: 'Nevo melanocítico benigno',
        tratamiento: 'Cuidado post-quirúrgico de la herida',
        notas: 'Procedimiento realizado sin complicaciones. Resultados de biopsia: benigno.',
        archivos: [
          { nombre: 'Informe_procedimiento.pdf', tipo: 'pdf' },
          { nombre: 'Foto_previa.jpg', tipo: 'imagen' }
        ]
      },
      {
        id: 3,
        tipo: 'examen',
        titulo: 'Examen de vista anual',
        fecha: new Date('2023-02-10'),
        medico: { nombre: 'Javier', apPaterno: 'Ruiz', apMaterno: 'Sánchez' },
        especialidad: { idEspecialidad: 4, nombre: 'Oftalmología' },
        diagnostico: 'Miopía leve estable',
        tratamiento: 'Uso de lentes correctivos',
        notas: 'Graduación actual: OD -1.50, OI -1.75. No se observan cambios significativos.',
        archivos: [
          { nombre: 'Resultados_examen.pdf', tipo: 'pdf' }
        ]
      },
      {
        id: 4,
        tipo: 'consulta',
        titulo: 'Control pediátrico',
        fecha: new Date('2022-11-05'),
        medico: { nombre: 'Ana', apPaterno: 'García', apMaterno: 'Martínez' },
        especialidad: { idEspecialidad: 3, nombre: 'Pediatría' },
        diagnostico: 'Niño sano, desarrollo normal',
        tratamiento: 'Vacunación según calendario',
        notas: 'Peso y talla en percentil 50. Recomendaciones de alimentación entregadas.'
      },
      {
        id: 5,
        tipo: 'examen',
        titulo: 'Análisis de sangre completo',
        fecha: new Date('2022-09-18'),
        diagnostico: 'Resultados dentro de parámetros normales',
        notas: 'Hemoglobina 14 g/dL, Glucosa 92 mg/dL, Colesterol total 180 mg/dL',
        archivos: [
          { nombre: 'Analisis_sangre.pdf', tipo: 'pdf' },
          { nombre: 'Resultados_detallados.pdf', tipo: 'pdf' }
        ]
      }
    ];
    this.aniosDisponibles = [...new Set(this.registros.map(r => r.fecha.getFullYear()))].sort((a, b) => b - a);
    this.aplicarFiltros();
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
