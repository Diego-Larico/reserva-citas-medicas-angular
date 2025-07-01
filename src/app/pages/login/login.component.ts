import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Si hay un email en queryParams, autorrellenar el campo email
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    if (email) {
      this.email = email;
    }
  }

  login() {
    // ...validación de campos...
    this.authService.login(this.email, this.password).subscribe({
      next: (usuario) => {
        if (usuario && usuario.activo === false) {
          alert('Usuario desactivado, comuníquese con un administrador');
          return;
        }
        console.log('Login correcto', usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        // Guardar idUsuario para acceso global
        if (usuario && usuario.idUsuario) {
          localStorage.setItem('idUsuario', usuario.idUsuario.toString());
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // ...manejo de error de credenciales...
        console.error('Error en login', err);
        alert('Credenciales incorrectas');
      }
    });
  }
}
