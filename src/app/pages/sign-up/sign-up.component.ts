import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  apellidoPaterno = '';
  apellidoMaterno = '';
  nombres = '';
  usuario = '';
  correo = '';
  password = '';
  confirmPassword = '';

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  onSubmit() {
    // Validación HTML5 automática por required y type=email
    if (!this.apellidoPaterno || !this.apellidoMaterno || !this.nombres || !this.usuario || !this.correo || !this.password || !this.confirmPassword) {
      // Esto normalmente no ocurre por required, pero por seguridad:
      alert('Todos los campos son obligatorios');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Validar email con expresión regular (adicional a HTML5)
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(this.correo)) {
      alert('Ingrese un correo electrónico válido');
      return;
    }
    // Verificar si el usuario o correo ya existen
    this.usuarioService.getUsuarios().subscribe(usuarios => {
      const existeEmail = usuarios.some(u => u.email.toLowerCase() === this.correo.toLowerCase());
      if (existeEmail) {
        alert('El correo electrónico ya está registrado');
        return;
      }
      const existeUsuario = usuarios.some(u => u.usuario.toLowerCase() === this.usuario.toLowerCase());
      if (existeUsuario) {
        alert('El nombre de usuario ya existe');
        return;
      }
      // Crear usuario
      const nuevoUsuario: Usuario = {
        idUsuario: 0,
        apPaterno: this.apellidoPaterno,
        apMaterno: this.apellidoMaterno,
        nombre: this.nombres,
        usuario: this.usuario,
        email: this.correo,
        password: this.password,
        idRol: 3, // Paciente por defecto
        idEspecialidad: 1, // Por defecto
        activo: true
      };
      this.usuarioService.crearUsuario(nuevoUsuario).subscribe({
        next: (ok) => {
          if (ok) {
            alert('Registro exitoso');
            this.router.navigate(['/'], { queryParams: { email: this.correo } });
          } else {
            alert('Error al registrar usuario');
          }
        },
        error: () => {
          alert('Error al registrar usuario');
        }
      });
    });
  }
}
