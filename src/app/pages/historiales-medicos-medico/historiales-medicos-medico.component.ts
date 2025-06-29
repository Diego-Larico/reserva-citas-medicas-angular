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
          this.cargarResumen(); // Actualiza el resumen dinámicamente
        });
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarResumen(): void {
    // Calcular resumen dinámicamente
    const totalHistoriales = this.historiales.length;
    const pacientesSet = new Set(
      this.historiales
        .filter(h => h.paciente)
        .map(h => h.paciente.dni || h.paciente.idUsuario || h.paciente.nombre + h.paciente.apPaterno)
    );
    let tratamientosRecetados = 0;
    let diagnosticos: {[key: string]: number} = {};
    this.historiales.forEach(h => {
      if (h.tratamientos && Array.isArray(h.tratamientos)) {
        tratamientosRecetados += h.tratamientos.length;
      }
      if (h.diagnosticoPrincipal) {
        diagnosticos[h.diagnosticoPrincipal] = (diagnosticos[h.diagnosticoPrincipal] || 0) + 1;
      }
    });
    // Diagnóstico más común (puedes mostrar el nombre si lo deseas)
    const diagnosticosComunes = Object.keys(diagnosticos).length;
    this.resumen = {
      totalHistoriales,
      pacientesUnicos: pacientesSet.size,
      tratamientosRecetados,
      diagnosticosComunes
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

  calcularEdad(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'fecha no registrada';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad.toString();
  }

  descargarHistorial(idHistorial: number): void {
    // Simulación de descarga de PDF
    const blob = new Blob([`PDF simulado para historial ${idHistorial}`], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `historial_${idHistorial}.pdf`;
    link.click();
  }

  imprimirHistorial(idHistorial: number): void {
    // Busca el historial por id
    const historial = this.historiales.find(h => h.idHistorial === idHistorial);
    if (!historial) return;
    // Crea una ventana nueva con los detalles de la cita/historial
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>Imprimir Historial Médico</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h2 { color: #0D8ABC; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Historial Médico</h2>
        <div class="section">
          <span class="label">Paciente:</span> ${historial.paciente?.nombre || ''} ${historial.paciente?.apPaterno || ''} ${historial.paciente?.apMaterno || ''}<br>
          <span class="label">Edad:</span> ${this.calcularEdad(historial.paciente?.fechaNacimiento)}<br>
          <span class="label">DNI:</span> ${historial.paciente?.dni || 'Sin DNI'}<br>
        </div>
        <div class="section">
          <span class="label">Fecha de la cita:</span> ${historial.cita?.fecha_hora ? (new Date(historial.cita.fecha_hora)).toLocaleString() : ''}<br>
          <span class="label">Motivo:</span> ${historial.cita?.motivo || ''}<br>
          <span class="label">Médico:</span> Dr. ${historial.medico?.nombre || ''} ${historial.medico?.apPaterno || ''}<br>
          <span class="label">Especialidad:</span> ${historial.cita?.especialidad?.nombre || ''}<br>
        </div>
        <div class="section">
          <span class="label">Diagnóstico principal:</span> ${historial.diagnosticoPrincipal}<br>
          <span class="label">Notas médicas:</span> ${historial.notasMedicas || 'Sin notas'}<br>
        </div>
        <div class="section">
          <span class="label">Tratamientos:</span><br>
          ${(historial.tratamientos && historial.tratamientos.length > 0) ? historial.tratamientos.map((t: any) => `
            <div>- ${t.medicamento} (${t.dosis}, ${t.frecuencia}, ${t.duracion})</div>
          `).join('') : 'Sin tratamientos'}
        </div>
        <div class="section">
          <span class="label">Observaciones:</span> ${historial.observaciones || 'No se registraron observaciones'}
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
