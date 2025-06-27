import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login', error);
        alert('Credenciales incorrectas');
      }
    });
  }
}
