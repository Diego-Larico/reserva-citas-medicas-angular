import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
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

  constructor(private router: Router, private usuarioService: UsuarioService) {}

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

  actualizarPassword(): void {
    console.log('Contraseña actualizada');
    this.passwordActual = '';
    this.nuevoPassword = '';
    this.confirmarPassword = '';
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

  formularioPasswordValido(): boolean {
    return this.passwordActual.length > 0 && 
           this.nuevoPassword.length >= 8 && 
           this.nuevoPassword === this.confirmarPassword;
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
