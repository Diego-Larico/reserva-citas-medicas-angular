
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  step: 'recuperar' | 'verificar' | 'nueva_contrasena' = 'recuperar';
  correo: string = '';
  codigo: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  mensaje: string = '';
  cargando: boolean = false;

  @Output() cerrar = new EventEmitter<string>();

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  cerrarRecuperar(): void {
    this.step = 'recuperar';
    this.correo = '';
    this.codigo = '';
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
    this.mensaje = '';
    this.cerrar.emit();
  }

  async enviarCodigo() {
    this.mensaje = '';
    if (!this.correo) return;
    this.cargando = true;
    try {
      const ok = await this.usuarioService.enviarCodigoRecuperacion(this.correo).toPromise();
      if (ok) {
        window.alert('Se ha enviado un código de verificación a tu correo.');
        this.step = 'verificar';
      } else {
        this.mensaje = 'No se pudo enviar el código. Verifica el correo ingresado.';
      }
    } catch (e) {
      this.mensaje = 'No se pudo enviar el código. Verifica el correo ingresado.';
    }
    this.cargando = false;
  }

  async verificarCodigo() {
    this.mensaje = '';
    if (!this.codigo) return;
    this.cargando = true;
    try {
      const ok = await this.usuarioService.validarCodigoRecuperacion(this.correo, this.codigo).toPromise();
      if (ok) {
        window.alert('Código verificado. Ahora puedes ingresar una nueva contraseña.');
        this.step = 'nueva_contrasena';
      } else {
        this.mensaje = 'El código ingresado no es válido o ha expirado.';
      }
    } catch (e) {
      this.mensaje = 'El código ingresado no es válido o ha expirado.';
    }
    this.cargando = false;
  }

  async cambiarContrasena() {
    this.mensaje = '';
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      this.mensaje = 'Debes completar ambos campos de contraseña.';
      return;
    }
    if (this.nuevaContrasena.length < 8) {
      this.mensaje = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }
    this.cargando = true;
    try {
      const ok = await this.usuarioService.actualizarPasswordPorEmail(this.correo, this.nuevaContrasena).toPromise();
      if (ok) {
        window.alert('Tu contraseña ha sido actualizada correctamente.');
        this.cerrar.emit(this.correo);
      } else {
        this.mensaje = 'No se pudo actualizar la contraseña. Intenta nuevamente.';
      }
    } catch (e) {
      this.mensaje = 'No se pudo actualizar la contraseña. Intenta nuevamente.';
    }
    this.cargando = false;
  }
}
