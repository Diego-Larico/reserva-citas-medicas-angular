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

  constructor(
    private citaService: CitaService,
    private historialClinicoService: HistorialClinicoService,
    private usuarioService: UsuarioService
  ) {}

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
    this.historialClinicoService.obtenerHistorialesPorMedico(+idMedico).subscribe({
      next: (historiales) => {
        // Para cada historial, obtener cita y paciente
        const historialRequests = historiales.map((historial: any) => {
          return new Promise<any>((resolve) => {
            this.citaService.getCitas().subscribe({
              next: (citas) => {
                const cita = citas.find((c: any) => c.idCita === historial.idCita);
                if (cita) {
                  this.usuarioService.getUsuarioPorId(cita.idPaciente).subscribe({
                    next: (paciente) => {
                      resolve({
                        ...historial,
                        paciente,
                        fechaCreacion: historial.fechaCreacion || cita.fecha_hora,
                        diagnosticoPrincipal: historial.diagnosticoPrincipal,
                        notasMedicas: historial.notasMedicas,
                        tratamientos: [], // Puedes cargar tratamientos si lo deseas
                        cita
                      });
                    },
                    error: () => {
                      resolve({ ...historial, paciente: null, cita });
                    }
                  });
                } else {
                  resolve({ ...historial, paciente: null, cita: null });
                }
              },
              error: () => resolve({ ...historial, paciente: null, cita: null })
            });
          });
        });
        Promise.all(historialRequests).then((historialesCompletos) => {
          this.historiales = historialesCompletos;
          this.historialesFiltrados = [...this.historiales];
          this.cargando = false;
        });
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
