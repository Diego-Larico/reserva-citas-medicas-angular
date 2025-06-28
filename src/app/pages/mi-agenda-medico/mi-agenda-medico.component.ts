import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService, Cita } from '../../services/cita.service';
import { Usuario } from '../../models/usuario';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { UsuarioService } from '../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-agenda-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-agenda-medico.component.html',
  styleUrls: ['./mi-agenda-medico.component.css']
})
export class MiAgendaMedicoComponent implements OnInit {
  usuario: Usuario | null = null;
  fechaActual: Date = new Date();
  filtroEstado: string = 'todas';
  filtroPaciente: string = '';

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];

  resumenDia: any = {
    totalCitas: 0,
    porAtender: 0,
    atendidas: 0,
    procedimientos: 0
  };

  citaEnAtencion: Cita | null = null;
  historialTemporal: any = {
    iCita: 0,
    idMedico: 0,
    diagnosticoPrincipal: '',
    codigoCIE10: '',
    notasMedicas: ''
  };
  tratamientosTemporales: any[] = [];

  filtrandoPorFecha: boolean = false;

  constructor(
    private citaService: CitaService,
    private especialidadService: EspecialidadService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.usuario = this.getUsuarioActual();
    this.cargarCitas();
  }

  getUsuarioActual(): Usuario | null {
    // Se asume que el usuario autenticado está en localStorage bajo 'user' (ajusta si tu app lo guarda diferente)
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  cargarCitas(): void {
    if (!this.usuario) return;
    this.citaService.getCitas().subscribe(async (citas) => {
      // Filtrar solo por médico
      let citasFiltradas = citas.filter(c => c.idMedico === this.usuario!.idUsuario);
      // Si está activado el filtro por fecha, filtrar también por la fecha seleccionada
      if (this.filtrandoPorFecha) {
        citasFiltradas = citasFiltradas.filter(c => new Date(c.fecha_hora).toDateString() === this.fechaActual.toDateString());
      }
      this.citas = await Promise.all(citasFiltradas.map(async (cita) => {
        let paciente = await this.usuarioService.getUsuarioPorId(cita.idPaciente).toPromise();
        // Si por alguna razón no se encuentra el paciente, crea uno vacío con datos estáticos
        if (!paciente) {
          paciente = {
            idUsuario: cita.idPaciente,
            apPaterno: '',
            apMaterno: '',
            nombre: 'Paciente',
            usuario: '',
            email: '',
            password: '',
            idRol: 0,
            idEspecialidad: 0,
            telefono: 'No registrado',
            fechaNacimiento: '1990-01-01',
            genero: 'No especificado',
            antecedentes: 'Sin antecedentes registrados'
          };
        } else {
          paciente = {
            ...paciente,
            telefono: (paciente as any).telefono || 'No registrado',
            fechaNacimiento: (paciente as any).fechaNacimiento || '1990-01-01',
            genero: (paciente as any).genero || 'No especificado',
            antecedentes: (paciente as any).antecedentes || 'Sin antecedentes registrados'
          };
        }
        return { ...cita, paciente };
      }));
      this.aplicarFiltros();
      this.calcularResumenDia();
    });
  }

  aplicarFiltros(): void {
    this.citasFiltradas = this.citas.filter(cita => {
      const cumpleEstado = this.filtroEstado === 'todas' || cita.estado === this.filtroEstado;
      const cumplePaciente = !this.filtroPaciente ||
        (`${(cita as any).paciente?.nombre || ''} ${(cita as any).paciente?.apPaterno || ''}`.toLowerCase().includes(this.filtroPaciente.toLowerCase()));
      return cumpleEstado && cumplePaciente;
    }).sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  }

  cambiarFecha(dias: number): void {
    const nuevaFecha = new Date(this.fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    this.fechaActual = nuevaFecha;
    if (this.filtrandoPorFecha) {
      this.cargarCitas();
    }
  }

  calcularResumenDia(): void {
    this.resumenDia = {
      totalCitas: this.citas.length,
      porAtender: this.citas.filter(c => c.estado === 'Confirmada' || c.estado === 'Pendiente').length,
      atendidas: this.citas.filter(c => c.estado === 'Completada').length,
      procedimientos: this.citas.filter(c => (c as any).historial && c.estado === 'Completada').length
    };
  }

  async confirmarCita(idCita: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Confirmar cita?',
      text: '¿Estás seguro de que deseas confirmar esta cita?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#218838',
      cancelButtonColor: '#d33'
    });
    if (result.isConfirmed) {
      const cita = this.citas.find(c => c.idCita === idCita);
      if (cita) {
        cita.estado = 'Confirmada';
        this.citaService.actualizarCita(cita).subscribe(() => {
          this.aplicarFiltros();
          this.calcularResumenDia();
          Swal.fire('Cita confirmada', '', 'success');
        });
      }
    }
  }

  async cancelarCita(idCita: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Cancelar cita?',
      text: '¿Estás seguro de que deseas cancelar esta cita?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
    if (result.isConfirmed) {
      const cita = this.citas.find(c => c.idCita === idCita);
      if (cita) {
        cita.estado = 'Cancelada';
        this.citaService.actualizarCita(cita).subscribe(() => {
          this.aplicarFiltros();
          this.calcularResumenDia();
          Swal.fire('Cita cancelada', '', 'success');
        });
      }
    }
  }

  iniciarAtencion(cita: Cita): void {
    this.citaEnAtencion = cita;
    this.historialTemporal = {
      iCita: cita.idCita,
      idMedico: this.usuario?.idUsuario,
      diagnosticoPrincipal: (cita as any).historial?.diagnosticoPrincipal || '',
      codigoCIE10: (cita as any).historial?.codigoCIE10 || '',
      notasMedicas: (cita as any).historial?.notasMedicas || ''
    };
    this.tratamientosTemporales = [];
    if ((cita as any).historial) {
      // Aquí podrías cargar tratamientos reales si tienes un servicio
      this.tratamientosTemporales = [
        {
          medicamento: 'Ibuprofeno',
          dosis: '400mg',
          frecuencia: 'Cada 8 horas',
          duracion: '5 días',
          instrucciones: 'Tomar con alimentos'
        }
      ];
    }
  }

  agregarTratamiento(): void {
    this.tratamientosTemporales.push({
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    });
  }

  eliminarTratamiento(index: number): void {
    this.tratamientosTemporales.splice(index, 1);
  }

  calcularEdad(fechaNacimiento: string | Date | undefined): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  async guardarAtencion(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Guardar atención médica?',
      text: '¿Deseas guardar los datos de la atención y finalizar la cita?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#218838',
      cancelButtonColor: '#d33'
    });
    if (result.isConfirmed && this.citaEnAtencion) {
      this.citaEnAtencion.estado = 'Completada';
      (this.citaEnAtencion as any).historial = {
        idHistorial: Math.floor(Math.random() * 1000) + 1, // Simulado
        diagnosticoPrincipal: this.historialTemporal.diagnosticoPrincipal,
        codigoCIE10: this.historialTemporal.codigoCIE10,
        notasMedicas: this.historialTemporal.notasMedicas
      };
      this.citaService.actualizarCita(this.citaEnAtencion).subscribe(() => {
        this.aplicarFiltros();
        this.calcularResumenDia();
        this.cerrarModal();
        Swal.fire('Atención guardada', '', 'success');
      });
    }
  }

  verHistorial(idHistorial: number): void {
    // Aquí podrías navegar a la vista de historial médico
    alert('Ver historial: ' + idHistorial);
  }

  cerrarModal(): void {
    this.citaEnAtencion = null;
    this.historialTemporal = {
      iCita: 0,
      idMedico: 0,
      diagnosticoPrincipal: '',
      codigoCIE10: '',
      notasMedicas: ''
    };
    this.tratamientosTemporales = [];
  }

  toggleFiltrarPorFecha(): void {
    this.filtrandoPorFecha = !this.filtrandoPorFecha;
    this.cargarCitas();
  }

  resetFiltros(): void {
    this.filtroEstado = 'todas';
    this.filtroPaciente = '';
    this.cargarCitas();
  }

  getFechaActualFormateada(): string {
    return this.fechaActual.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
