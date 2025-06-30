import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService, Cita } from '../../services/cita.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { MedicoService } from '../../services/medico.service';
import { Usuario } from '../../models/usuario';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

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
    private medicoService: MedicoService,
    private router: Router
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

  limpiarFiltros() {
    this.filtroEstado = 'todas';
    this.filtroFecha = '';
    this.aplicarFiltros();
  }

  cancelarCita(idCita: number) {
    const cita = this.citas.find(c => c.idCita === idCita);
    if (!cita) return;
    // SweetAlert2 confirmación
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: '¿Cancelar cita?',
        text: '¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No',
        background: '#fff',
        color: '#1a5a9e',
        customClass: { popup: 'swal2-popup-custom', confirmButton: 'swal2-confirm-custom' }
      }).then(result => {
        if (result.isConfirmed) {
          // Cambiar estado a Cancelada y actualizar en la base de datos
          const citaCancelada = { ...cita, estado: 'Cancelada' };
          this.citaService.actualizarCita(citaCancelada).subscribe({
            next: () => {
              cita.estado = 'Cancelada';
              this.aplicarFiltros();
              Swal.default.fire({
                icon: 'success',
                title: 'Cita cancelada',
                text: 'La cita fue cancelada exitosamente.',
                confirmButtonText: 'Aceptar',
                background: '#fff',
                color: '#1a5a9e',
                customClass: { popup: 'swal2-popup-custom', confirmButton: 'swal2-confirm-custom' }
              });
            },
            error: () => {
              Swal.default.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cancelar la cita. Intenta nuevamente.',
                confirmButtonText: 'Aceptar',
                background: '#fff',
                color: '#1a5a9e',
                customClass: { popup: 'swal2-popup-custom', confirmButton: 'swal2-confirm-custom' }
              });
            }
          });
        }
      });
    });
  }

  verDetalleCita(cita: Cita) {
    this.citaSeleccionada = cita;
  }

  cerrarModal() {
    this.citaSeleccionada = null;
  }

  irANuevaCita() {
    this.router.navigate(['/dashboard/nueva-cita']);
  }
}
