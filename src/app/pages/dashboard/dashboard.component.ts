import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  user: Usuario | null = null;

  constructor(private router: Router) {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }
}
