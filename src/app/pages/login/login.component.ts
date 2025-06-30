import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    console.log('Datos enviados:', this.email, this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: (usuario) => {
        console.log('Login correcto', usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        // Guardar idUsuario para acceso global
        if (usuario && usuario.idUsuario) {
          localStorage.setItem('idUsuario', usuario.idUsuario.toString());
        }
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login', error);
        alert('Credenciales incorrectas');
      }
    });
  }
}
