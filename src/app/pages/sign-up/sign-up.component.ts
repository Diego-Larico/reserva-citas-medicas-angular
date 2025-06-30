import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  onSubmit() {
    // Aquí va la lógica de registro (puedes conectar con el backend o mostrar un mensaje)
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Lógica de registro aquí
    alert('Registro exitoso (simulado)');
  }
}
