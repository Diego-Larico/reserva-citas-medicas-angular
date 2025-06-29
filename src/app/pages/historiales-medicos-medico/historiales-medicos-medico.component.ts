import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { HistorialClinicoService } from '../../services/historial-clinico.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-historiales-medicos-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historiales-medicos-medico.component.html',
  styleUrl: './historiales-medicos-medico.component.css'
})
export class HistorialesMedicosMedicoComponent implements OnInit {
  historiales: any[] = [];
  historialesFiltrados: any[] = [];
  historialSeleccionado: any = null;
  filtroBusqueda: string = '';
  filtroFecha: string = 'todos';
  resumen: any = {
    totalHistoriales: 0,
    pacientesUnicos: 0,
    tratamientosRecetados: 0,
    diagnosticosComunes: 0
  };
  cargando: boolean = false;

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.cargarHistoriales();
    this.cargarResumen();
  }

  cargarHistoriales(): void {
    this.cargando = true;
    const idMedico = localStorage.getItem('idUsuario');
    if (!idMedico) {
      this.cargando = false;
      return;
    }
    // Simulación: obtener todas las citas del médico y mapear a "historiales"
    this.citaService.getCitas().subscribe({
      next: (citas) => {
        const historiales = citas.filter(c => c.idMedico === +idMedico).map(c => ({
          idHistorial: c.idCita, // Simulación: usar idCita como idHistorial
          paciente: {
            nombre: 'Paciente',
            apPaterno: 'Demo',
            apMaterno: '',
            email: 'paciente@demo.com',
            idUsuario: c.idPaciente,
            fechaNacimiento: '1990-01-01'
          },
          fechaCreacion: c.fecha_hora,
          diagnosticoPrincipal: c.motivo || 'Diagnóstico de ejemplo',
          notasMedicas: 'Notas de ejemplo',
          tratamientos: [
            { medicamento: 'Paracetamol', dosis: '500mg', frecuencia: '2 veces al día', duracion: '5 días', instrucciones: 'Tomar con agua' }
          ]
        }));
        this.historiales = historiales;
        this.historialesFiltrados = [...this.historiales];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarResumen(): void {
    // Simulación de resumen estático
    this.resumen = {
      totalHistoriales: 5,
      pacientesUnicos: 3,
      tratamientosRecetados: 7,
      diagnosticosComunes: 2
    };
  }

  aplicarFiltros(): void {
    this.historialesFiltrados = this.historiales.filter(historial => {
      const textoBusqueda = this.filtroBusqueda.toLowerCase();
      const coincideBusqueda =
        (historial.paciente.nombre + ' ' + historial.paciente.apPaterno).toLowerCase().includes(textoBusqueda) ||
        (historial.diagnosticoPrincipal?.toLowerCase().includes(textoBusqueda)) ||
        (historial.notasMedicas?.toLowerCase().includes(textoBusqueda));
      let coincideFecha = true;
      if (this.filtroFecha !== 'todos') {
        const fechaHistorial = new Date(historial.fechaCreacion);
        const hoy = new Date();
        switch(this.filtroFecha) {
          case 'hoy':
            coincideFecha = fechaHistorial.toDateString() === hoy.toDateString();
            break;
          case 'semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            coincideFecha = fechaHistorial >= inicioSemana;
            break;
          case 'mes':
            coincideFecha = fechaHistorial.getMonth() === hoy.getMonth() && fechaHistorial.getFullYear() === hoy.getFullYear();
            break;
          case 'anio':
            coincideFecha = fechaHistorial.getFullYear() === hoy.getFullYear();
            break;
        }
      }
      return coincideBusqueda && coincideFecha;
    });
  }

  verDetalleHistorial(idHistorial: number): void {
    // Simulación: buscar historial en la lista
    this.historialSeleccionado = this.historiales.find(h => h.idHistorial === idHistorial);
  }

  cerrarModal(): void {
    this.historialSeleccionado = null;
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

  descargarHistorial(idHistorial: number): void {
    // Simulación de descarga de PDF
    const blob = new Blob([`PDF simulado para historial ${idHistorial}`], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `historial_${idHistorial}.pdf`;
    link.click();
  }
}
