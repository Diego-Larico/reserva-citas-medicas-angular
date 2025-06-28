import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { CitaService } from '../../services/cita.service';
import { Usuario } from '../../models/usuario';
import Swal from 'sweetalert2';

interface Preferencias {
  idioma: string;
  tema: string;
  notificacionesEmail: boolean;
  notificacionesSMS: boolean;
  recordatorioCitas: boolean;
}

interface ResumenHistorial {
  totalCitas: number;
  totalProcedimientos: number;
  totalExamenes: number;
  especialistasVisitados: number;
}

interface RegistroReciente {
  id: number;
  fecha: Date;
  titulo: string;
  especialidad?: string;
  medico?: string;
}

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MiPerfilComponent implements OnInit {
  usuario: Usuario = {
    idUsuario: 0,
    nombre: '',
    apPaterno: '',
    apMaterno: '',
    usuario: '',
    email: '',
    password: '',
    idRol: 3,
    idEspecialidad: 1
  };
  usuarioEdit: Usuario = { ...this.usuario };

  seccionActual: string = 'informacion';
  passwordActual: string = '';
  nuevoPassword: string = '';
  confirmarPassword: string = '';
  passwordStrength: number = 0;
  passwordStrengthText: string = '';

  preferencias: Preferencias = {
    idioma: 'es',
    tema: 'azul',
    notificacionesEmail: true,
    notificacionesSMS: false,
    recordatorioCitas: true
  };

  resumenHistorial: ResumenHistorial = {
    totalCitas: 0,
    totalProcedimientos: 0,
    totalExamenes: 0,
    especialistasVisitados: 0
  };

  registrosRecientes: RegistroReciente[] = [];

  constructor(private router: Router, private usuarioService: UsuarioService, private citaService: CitaService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    console.log('[Perfil] localStorage[usuario]:', userData);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('[Perfil] Usuario parseado:', user);
      this.usuarioService.getUsuarioPorId(user.idUsuario).subscribe({
        next: usuario => {
          console.log('[Perfil] Respuesta backend usuario:', usuario);
          this.usuario = usuario;
          this.usuarioEdit = { ...usuario };
          if (!usuario.rol) {
            this.usuario.rol = this.getRolFromId(usuario.idRol);
          }
          console.log('[Perfil] Usuario final en componente:', this.usuario);
        },
        error: err => {
          console.error('[Perfil] Error obteniendo usuario del backend:', err);
        }
      });

      // Cargar citas completadas del usuario
      this.citaService.getCitasPorPaciente(user.idUsuario).subscribe(citas => {
        const completadas = citas.filter(c => c.estado === 'Completada');
        this.resumenHistorial.totalCitas = completadas.length;
        this.registrosRecientes = completadas
          .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
          .slice(0, 5)
          .map(c => ({
            id: c.idCita,
            fecha: new Date(c.fecha_hora),
            titulo: c.motivo || 'Cita médica'
          }));
      });
    } else {
      console.warn('[Perfil] No se encontró usuario en localStorage.');
    }
    // Aquí puedes cargar resumenHistorial y registrosRecientes desde servicios reales si existen
  }

  get fotoPerfil(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent((this.usuario.nombre || '') + ' ' + (this.usuario.apPaterno || ''))}&background=2a7cc7&color=fff&size=128&rounded=true&bold=true`;
  }

  getRolFromId(idRol: number): { idRol: number, nombre: string } | undefined {
    // Puedes reemplazar esto por una petición a un servicio de roles si lo deseas
    const roles = [
      { idRol: 1, nombre: 'Administrador' },
      { idRol: 2, nombre: 'Médico' },
      { idRol: 3, nombre: 'Paciente' }
    ];
    return roles.find(r => r.idRol === idRol);
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActual = seccion;
  }

  actualizarInformacion(): void {
    // Verificar si hubo cambios
    const cambios = Object.keys(this.usuarioEdit).some(key => (this.usuario as any)[key] !== (this.usuarioEdit as any)[key]);
    if (!cambios) {
      Swal.fire('Sin cambios', 'No se han realizado cambios en la información.', 'info');
      return;
    }
    Swal.fire({
      title: '¿Guardar cambios?',
      text: '¿Deseas actualizar tu información personal?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.actualizarUsuario(this.usuarioEdit).subscribe({
          next: (ok) => {
            if (ok) {
              this.usuario = { ...this.usuarioEdit };
              // Asegurar que el rol se mantenga después de guardar
              if (!this.usuario.rol) {
                this.usuario.rol = this.getRolFromId(this.usuario.idRol);
              }
              Swal.fire('¡Actualizado!', 'Tu información ha sido actualizada.', 'success');
            } else {
              Swal.fire('Error', 'No se pudo actualizar la información.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al actualizar.', 'error');
          }
        });
      }
    });
  }

  cancelarEdicion(): void {
    this.usuarioEdit = { ...this.usuario };
    console.log('Edición cancelada');
  }

  formularioPasswordValido(): boolean {
    // El botón se activa si los 3 campos tienen valor
    return (
      this.passwordActual.length > 0 &&
      this.nuevoPassword.length > 0 &&
      this.confirmarPassword.length > 0
    );
  }

  actualizarPassword(): void {
    // Validaciones completas antes de enviar
    if (!this.passwordActual || !this.nuevoPassword || !this.confirmarPassword) {
      Swal.fire('Campos incompletos', 'Por favor, completa todos los campos.', 'warning');
      return;
    }
    if (this.nuevoPassword.length < 8) {
      Swal.fire('Contraseña débil', 'La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }
    if (this.nuevoPassword !== this.confirmarPassword) {
      Swal.fire('No coinciden', 'La nueva contraseña y la confirmación no coinciden.', 'error');
      return;
    }
    if (this.passwordActual === this.nuevoPassword) {
      Swal.fire('Sin cambios', 'La nueva contraseña no puede ser igual a la actual.', 'info');
      return;
    }
    // Validar contraseña actual con backend
    this.usuarioService.getUsuarioPorId(this.usuario.idUsuario).subscribe({
      next: (usuario) => {
        if (usuario.password !== this.passwordActual) {
          Swal.fire('Contraseña incorrecta', 'La contraseña actual no es correcta.', 'error');
          return;
        }
        // Actualizar contraseña en backend
        const usuarioActualizado = { ...usuario, password: this.nuevoPassword };
        this.usuarioService.actualizarUsuario(usuarioActualizado).subscribe({
          next: (ok) => {
            if (ok) {
              this.usuario.password = this.nuevoPassword;
              this.passwordActual = '';
              this.nuevoPassword = '';
              this.confirmarPassword = '';
              Swal.fire('¡Contraseña actualizada!', 'Tu contraseña ha sido cambiada exitosamente.', 'success');
            } else {
              Swal.fire('Error', 'No se pudo actualizar la contraseña.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al actualizar la contraseña.', 'error');
          }
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo validar la contraseña actual.', 'error');
      }
    });
  }

  cancelarCambioPassword(): void {
    this.passwordActual = '';
    this.nuevoPassword = '';
    this.confirmarPassword = '';
  }

  actualizarPreferencias(): void {
    console.log('Preferencias actualizadas:', this.preferencias);
  }

  cancelarPreferencias(): void {
    console.log('Cambios en preferencias cancelados');
  }

  verDetalleRegistro(id: number): void {
    this.router.navigate(['/dashboard/historial'], { queryParams: { registro: id } });
  }

  verHistorialCompleto(): void {
    this.router.navigate(['/dashboard/historial']);
  }

  calcularFortalezaPassword(): void {
    let strength = 0;
    if (this.nuevoPassword.length >= 8) strength++;
    if (/\d/.test(this.nuevoPassword)) strength++;
    if (/[A-Z]/.test(this.nuevoPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(this.nuevoPassword)) strength++;
    this.passwordStrength = strength;
    switch(strength) {
      case 0: this.passwordStrengthText = ''; break;
      case 1: this.passwordStrengthText = 'Débil'; break;
      case 2: this.passwordStrengthText = 'Moderada'; break;
      case 3: this.passwordStrengthText = 'Fuerte'; break;
      case 4: this.passwordStrengthText = 'Muy fuerte'; break;
    }
  }
}
