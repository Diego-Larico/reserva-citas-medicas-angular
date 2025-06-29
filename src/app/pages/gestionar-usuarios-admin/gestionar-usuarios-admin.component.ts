import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestionar-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-usuarios-admin.component.html',
  styleUrl: './gestionar-usuarios-admin.component.css'
})
export class GestionarUsuariosAdminComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroBusqueda: string = '';
  filtroRol: string = 'todos';
  filtroEstado: string = 'todos';
  modalAbierto: boolean = false;
  modalAccion: 'crear' | 'editar' = 'crear';
  usuarioEditando: Usuario | null = null;
  usuarioForm: FormGroup;
  especialidades: any[] = [];
  roles: { idRol: number, nombre: string }[] = [
    { idRol: 1, nombre: 'admin' },
    { idRol: 2, nombre: 'medico' },
    { idRol: 3, nombre: 'paciente' }
  ];
  user: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private especialidadService: EspecialidadService
  ) {
    this.user = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apPaterno: ['', Validators.required],
      apMaterno: [''],
      email: ['', [Validators.required, Validators.email]],
      usuario: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      idRol: [3, Validators.required],
      idEspecialidad: [null],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEspecialidades();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];
      },
      error: (error) => {
        console.error('Error al cargar usuarios', error);
      }
    });
  }

  cargarEspecialidades(): void {
    this.especialidadService.getEspecialidades().subscribe({
      next: (data) => {
        this.especialidades = data;
      }
    });
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const textoBusqueda = this.filtroBusqueda.toLowerCase();
      const coincideBusqueda =
        (usuario.nombre + ' ' + usuario.apPaterno + ' ' + usuario.apMaterno).toLowerCase().includes(textoBusqueda) ||
        usuario.email.toLowerCase().includes(textoBusqueda) ||
        usuario.usuario.toLowerCase().includes(textoBusqueda);
      const coincideRol = this.filtroRol === 'todos' || usuario.idRol === Number(this.filtroRol);
      const coincideEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activo' && usuario.activo) ||
        (this.filtroEstado === 'inactivo' && !usuario.activo);
      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }

  abrirModalCrearUsuario(): void {
    this.modalAccion = 'crear';
    this.usuarioForm.reset({
      idRol: 3,
      activo: true
    });
    this.modalAbierto = true;
  }

  editarUsuario(usuario: Usuario): void {
    this.modalAccion = 'editar';
    this.usuarioEditando = usuario;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apPaterno: usuario.apPaterno,
      apMaterno: usuario.apMaterno,
      email: usuario.email,
      usuario: usuario.usuario,
      idRol: usuario.idRol,
      idEspecialidad: usuario.idEspecialidad,
      activo: usuario.activo
    });
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalAbierto = true;
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) return;
    const usuarioData = this.usuarioForm.value;
    if (this.modalAccion === 'crear') {
      this.usuarioService.crearUsuario(usuarioData).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear usuario', error);
        }
      });
    } else if (this.usuarioEditando) {
      this.usuarioService.actualizarUsuario({ ...this.usuarioEditando, ...usuarioData }).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar usuario', error);
        }
      });
    }
  }

  eliminarUsuario(idUsuario: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.usuarioService.eliminarUsuario(idUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error al eliminar usuario', error);
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.usuarioEditando = null;
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  getRolNombre(idRol: number): string {
    const rol = this.roles.find(r => r.idRol === idRol);
    return rol ? rol.nombre : '';
  }

  getEspecialidadNombre(idEspecialidad: number): string {
    const esp = this.especialidades.find(e => e.idEspecialidad === idEspecialidad);
    return esp ? esp.nombre : '';
  }

  cambiarEstadoUsuario(idUsuario: number, activo: boolean): void {
    this.usuarioService.cambiarEstadoUsuario(idUsuario, activo).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al cambiar estado de usuario', error);
      }
    });
  }

  cambiarRol(event: any): void {
    const rol = event.target.value;
    if (rol !== 'medico') {
      this.usuarioForm.get('idEspecialidad')?.setValue(null);
    }
  }
}
