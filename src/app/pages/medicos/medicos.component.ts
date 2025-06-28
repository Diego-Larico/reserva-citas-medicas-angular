import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MedicosComponent implements OnInit {
  filtroEspecialidad: string = 'todas';
  filtroBusqueda: string = '';
  medicos: any[] = [];
  medicosFiltrados: any[] = [];
  especialidades: Especialidad[] = [];
  medicoSeleccionado: any = null;

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarMedicos();
  }

  cargarEspecialidades(): void {
    this.especialidadService.getEspecialidades().subscribe(especialidades => {
      this.especialidades = especialidades.filter(e => e.idEspecialidad !== 1); // Excluir 'sin_especialidad'
    });
  }

  cargarMedicos(): void {
    this.medicoService.getMedicos().subscribe(medicos => {
      this.medicos = medicos.filter(m => m.idRol === 2 && m.idEspecialidad !== 1).map(m => {
        const nombre = m.nombre || '';
        const apPaterno = m.apPaterno || '';
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre + ' ' + apPaterno)}&background=2a7cc7&color=fff&size=128&rounded=true&bold=true`;
        return {
          ...m,
          especialidad: this.especialidades.find(e => e.idEspecialidad === m.idEspecialidad),
          fotoPerfil: (m as any).imagen || avatarUrl,
          horarios: ['Lunes a Viernes: 09:00 - 16:30']
        };
      });
      this.medicosFiltrados = [...this.medicos];
    });
  }

  aplicarFiltros(): void {
    this.medicosFiltrados = this.medicos.filter(medico => {
      const cumpleEspecialidad = this.filtroEspecialidad === 'todas' || medico.idEspecialidad === +this.filtroEspecialidad;
      const cumpleBusqueda = !this.filtroBusqueda || `${medico.nombre} ${medico.apPaterno} ${medico.apMaterno}`.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      return cumpleEspecialidad && cumpleBusqueda;
    });
  }

  verDetalleMedico(idUsuario: number): void {
    this.medicoSeleccionado = this.medicos.find(m => m.idUsuario === idUsuario) || null;
  }

  cerrarModal(): void {
    this.medicoSeleccionado = null;
  }

  agendarConMedico(idUsuario: number): void {
    const medico = this.medicos.find(m => m.idUsuario === idUsuario);
    if (medico) {
      this.router.navigate(['/dashboard/nueva-cita'], {
        queryParams: { medico: idUsuario, especialidad: medico.idEspecialidad }
      });
    }
  }
}
