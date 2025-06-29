import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  user: Usuario | null = null;
  userRol: 'paciente' | 'medico' | 'admin' | null = null;

  constructor(private router: Router) {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.user = JSON.parse(userData);
      if (this.user && this.user.idRol === 1) this.userRol = 'admin';
      else if (this.user && this.user.idRol === 2) this.userRol = 'medico';
      else if (this.user && this.user.idRol === 3) this.userRol = 'paciente';
    }

    // Redirección automática según el rol si la ruta es /dashboard
    if (window.location.pathname.endsWith('/dashboard') || window.location.pathname.endsWith('/dashboard/')) {
      if (this.userRol === 'medico') {
        this.router.navigate(['/dashboard/agenda']);
      } else if (this.userRol === 'paciente') {
        this.router.navigate(['/dashboard/citas']);
      } else if (this.userRol === 'admin') {
        this.router.navigate(['/dashboard/usuarios']);
      }
    }
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  irVistaInicial(event?: Event) {
    if (event) event.preventDefault();
    if (this.userRol === 'paciente') {
      this.router.navigate(['/dashboard/citas']);
    } else if (this.userRol === 'medico') {
      this.router.navigate(['/dashboard/agenda']);
    } else if (this.userRol === 'admin') {
      this.router.navigate(['/dashboard/gestionar-usuarios']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
