import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EspecialidadService } from '../../services/especialidad.service';
import { UsuarioService } from '../../services/usuario.service';
import { CitaService } from '../../services/cita.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestionar-especialidades-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-especialidades-admin.component.html',
  styleUrl: './gestionar-especialidades-admin.component.css'
})
export class GestionarEspecialidadesAdminComponent implements OnInit {
  especialidades: any[] = [];
  especialidadesFiltradas: any[] = [];
  filtroBusqueda: string = '';
  modalAbierto: boolean = false;
  modalAccion: 'crear' | 'editar' = 'crear';
  especialidadEditando: any = null;
  especialidadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private especialidadService: EspecialidadService,
    private usuarioService: UsuarioService,
    private citaService: CitaService
  ) {
    this.especialidadForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.especialidadService.getEspecialidades().subscribe({
      next: (especialidades) => {
        // Obtener médicos y citas en paralelo
        forkJoin({
          usuarios: this.usuarioService.getUsuarios(),
          citas: this.citaService.getCitas()
        }).subscribe({
          next: ({ usuarios, citas }) => {
            this.especialidades = especialidades
              .filter(e => e.nombre !== 'sin_especialidad')
              .map(e => {
                const totalMedicos = usuarios.filter(u => u.idRol === 2 && u.idEspecialidad === e.idEspecialidad).length;
                const totalCitas = citas.filter(c => c.idEspecialidad === e.idEspecialidad).length;
                return { ...e, totalMedicos, totalCitas };
              });
            this.especialidadesFiltradas = [...this.especialidades];
          },
          error: (error: any) => {
            console.error('Error al cargar médicos o citas', error);
            // Fallback: mostrar especialidades sin estadísticas
            this.especialidades = especialidades.filter(e => e.nombre !== 'sin_especialidad');
            this.especialidadesFiltradas = [...this.especialidades];
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar especialidades', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.especialidadesFiltradas = this.especialidades
      .filter(especialidad => especialidad.nombre !== 'sin_especialidad')
      .filter(especialidad => {
        const textoBusqueda = this.filtroBusqueda.toLowerCase();
        return especialidad.nombre.toLowerCase().includes(textoBusqueda);
      });
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  abrirModalCrearEspecialidad(): void {
    this.modalAccion = 'crear';
    this.especialidadForm.reset();
    this.modalAbierto = true;
  }

  editarEspecialidad(especialidad: any): void {
    this.modalAccion = 'editar';
    this.especialidadEditando = especialidad;
    this.especialidadForm.patchValue({
      nombre: especialidad.nombre
    });
    this.modalAbierto = true;
  }

  async guardarEspecialidad(): Promise<void> {
    if (this.especialidadForm.invalid) {
      return;
    }
    const especialidadData = this.especialidadForm.value;
    const accion = this.modalAccion === 'crear' ? 'crear' : 'editar';
    const result = await Swal.fire({
      title: accion === 'crear' ? '¿Crear especialidad?' : '¿Guardar cambios?',
      text: accion === 'crear' ? '¿Deseas crear esta especialidad?' : '¿Deseas guardar los cambios de la especialidad?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a5a9e',
      cancelButtonColor: '#d33',
      confirmButtonText: accion === 'crear' ? 'Crear' : 'Guardar',
      background: '#fff',
      color: '#1a5a9e',
    });
    if (!result.isConfirmed) return;
    if (this.modalAccion === 'crear') {
      this.especialidadService.crearEspecialidad(especialidadData).subscribe({
        next: () => {
          this.cargarEspecialidades();
          this.cerrarModal();
          Swal.fire({
            title: 'Especialidad creada',
            text: 'La especialidad se ha creado correctamente.',
            icon: 'success',
            confirmButtonColor: '#1a5a9e',
            background: '#fff',
            color: '#1a5a9e',
          });
        },
        error: (error: any) => {
          console.error('Error al crear especialidad', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear la especialidad.',
            icon: 'error',
            confirmButtonColor: '#1a5a9e',
            background: '#fff',
            color: '#1a5a9e',
          });
        }
      });
    } else {
      this.especialidadService.actualizarEspecialidad(
        this.especialidadEditando.idEspecialidad,
        especialidadData
      ).subscribe({
        next: () => {
          this.cargarEspecialidades();
          this.cerrarModal();
          Swal.fire({
            title: 'Especialidad actualizada',
            text: 'Los cambios se han guardado correctamente.',
            icon: 'success',
            confirmButtonColor: '#1a5a9e',
            background: '#fff',
            color: '#1a5a9e',
          });
        },
        error: (error: any) => {
          console.error('Error al actualizar especialidad', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la especialidad.',
            icon: 'error',
            confirmButtonColor: '#1a5a9e',
            background: '#fff',
            color: '#1a5a9e',
          });
        }
      });
    }
  }

  async eliminarEspecialidad(idEspecialidad: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar especialidad?',
      text: '¿Estás seguro de que deseas eliminar esta especialidad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a5a9e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      background: '#fff',
      color: '#1a5a9e',
    });
    if (!result.isConfirmed) return;
    this.especialidadService.eliminarEspecialidad(idEspecialidad).subscribe({
      next: () => {
        this.cargarEspecialidades();
        Swal.fire({
          title: 'Especialidad eliminada',
          text: 'La especialidad se ha eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#1a5a9e',
          background: '#fff',
          color: '#1a5a9e',
        });
      },
      error: (error: any) => {
        console.error('Error al eliminar especialidad', error);
        Swal.fire({
          title: 'No se puede eliminar',
          text: 'No se puede eliminar la especialidad porque tiene médicos o citas asociadas.',
          icon: 'error',
          confirmButtonColor: '#1a5a9e',
          background: '#fff',
          color: '#1a5a9e',
        });
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.especialidadEditando = null;
  }
}
