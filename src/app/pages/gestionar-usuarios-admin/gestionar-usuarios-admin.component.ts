import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
      activo: [true],
      // Nuevo campo para mostrar la descripción textual del estado
      estado_descripcion: ['']
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

      // Mapear filtroRol a idRol numérico
      let coincideRol = true;
      if (this.filtroRol !== 'todos') {
        let idRolFiltro = 0;
        if (this.filtroRol === 'admin') idRolFiltro = 1;
        else if (this.filtroRol === 'medico') idRolFiltro = 2;
        else if (this.filtroRol === 'paciente') idRolFiltro = 3;
        coincideRol = usuario.idRol === idRolFiltro;
      }

      // Mapear filtroEstado a booleano
      let coincideEstado = true;
      if (this.filtroEstado !== 'todos') {
        if (this.filtroEstado === 'activo') coincideEstado = !!usuario.activo;
        else if (this.filtroEstado === 'inactivo') coincideEstado = !usuario.activo;
      }

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }

  abrirModalCrearUsuario(): void {
    this.modalAccion = 'crear';
    // Asegura que confirmPassword esté en el form
    if (!this.usuarioForm.contains('confirmPassword')) {
      this.usuarioForm.addControl('confirmPassword', this.fb.control('', [Validators.required]));
    }
    // Quitar required de idEspecialidad
    this.usuarioForm.get('idEspecialidad')?.clearValidators();
    this.usuarioForm.get('idEspecialidad')?.updateValueAndValidity();
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.usuarioForm.reset({
      idRol: 3,
      activo: true
    });
    this.modalAbierto = true;
  }

  editarUsuario(usuario: Usuario): void {
    this.modalAccion = 'editar';
    this.usuarioEditando = usuario;
    // Elimina confirmPassword si existe
    if (this.usuarioForm.contains('confirmPassword')) {
      this.usuarioForm.removeControl('confirmPassword');
    }
    // Quitar required de idEspecialidad
    this.usuarioForm.get('idEspecialidad')?.clearValidators();
    this.usuarioForm.get('idEspecialidad')?.updateValueAndValidity();
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apPaterno: usuario.apPaterno,
      apMaterno: usuario.apMaterno,
      email: usuario.email,
      usuario: usuario.usuario,
      idRol: usuario.idRol,
      idEspecialidad: usuario.idEspecialidad,
      activo: usuario.activo,
      estado_descripcion: usuario.estado_descripcion
    });
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalAbierto = true;
  }

  async guardarUsuario(): Promise<void> {
    this.usuarioForm.markAllAsTouched();
    this.usuarioForm.markAsDirty();
    // Validación de campos requeridos y coincidencia de contraseñas
    if (this.usuarioForm.invalid) {
      // Si el email es inválido y fue tocado, mostrar error específico
      if (this.usuarioForm.get('email')?.errors?.['email']) {
        await Swal.fire({
          icon: 'error',
          title: 'Email inválido',
          text: 'Por favor, ingresa un email válido.',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
      // Si cualquier otro campo está vacío o inválido
      await Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor, llena todos los campos requeridos correctamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (this.modalAccion === 'crear') {
      const password = this.usuarioForm.get('password')?.value;
      const confirmPassword = this.usuarioForm.get('confirmPassword')?.value;
      if (password !== confirmPassword) {
        await Swal.fire({
          icon: 'error',
          title: 'Contraseñas no coinciden',
          text: 'La contraseña y la confirmación no son iguales.',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    }
    // Confirmación SweetAlert
    const confirm = await Swal.fire({
      title: this.modalAccion === 'crear' ? '¿Crear nuevo usuario?' : '¿Guardar cambios?',
      text: this.modalAccion === 'crear' ? 'Se creará un nuevo usuario.' : 'Se guardarán los cambios del usuario.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    if (!confirm.isConfirmed) return;
    const usuarioData = { ...this.usuarioForm.value };
    usuarioData.idRol = Number(usuarioData.idRol);
    if (usuarioData.idRol === 1 || usuarioData.idRol === 3) {
      usuarioData.idEspecialidad = 1;
    } else if (usuarioData.idEspecialidad !== null && usuarioData.idEspecialidad !== undefined && usuarioData.idEspecialidad !== '') {
      usuarioData.idEspecialidad = Number(usuarioData.idEspecialidad);
    } else {
      delete usuarioData.idEspecialidad;
    }
    delete usuarioData.estado_descripcion;
    delete usuarioData.confirmPassword;
    if (this.modalAccion === 'editar' && (!usuarioData.password || usuarioData.password === '')) {
      delete usuarioData.password;
    }
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

  async eliminarUsuario(idUsuario: number): Promise<void> {
    const confirm = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    if (!confirm.isConfirmed) return;
    this.usuarioService.eliminarUsuario(idUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario', error);
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.usuarioEditando = null;
    // Elimina confirmPassword si existe
    if (this.usuarioForm.contains('confirmPassword')) {
      this.usuarioForm.removeControl('confirmPassword');
    }
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

  async cambiarEstadoUsuario(idUsuario: number, activo: boolean): Promise<void> {
    const confirm = await Swal.fire({
      title: activo ? '¿Activar usuario?' : '¿Desactivar usuario?',
      text: activo ? 'El usuario podrá acceder al sistema.' : 'El usuario no podrá acceder al sistema.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: activo ? 'Sí, activar' : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    if (!confirm.isConfirmed) return;
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
    // Quitar required de idEspecialidad siempre
    this.usuarioForm.get('idEspecialidad')?.clearValidators();
    this.usuarioForm.get('idEspecialidad')?.updateValueAndValidity();
    if (rol !== 'medico' && rol !== 2) {
      this.usuarioForm.get('idEspecialidad')?.setValue(null);
    }
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroRol = 'todos';
    this.filtroEstado = 'todos';
    this.aplicarFiltros();
  }
}
