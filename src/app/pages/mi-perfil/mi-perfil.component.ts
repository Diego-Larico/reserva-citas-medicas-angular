import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  idUsuario: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  imagen?: string;
  fechaRegistro: Date;
  rol?: {
    idRol: number;
    nombre: string;
  };
}

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
    idUsuario: 1,
    nombre: 'Juan',
    apPaterno: 'Pérez',
    apMaterno: 'Gómez',
    email: 'juan.perez@example.com',
    telefono: '5551234567',
    fechaNacimiento: '1985-06-15',
    direccion: 'Calle Falsa 123, Col. Centro, CDMX',
    imagen: '',
    fechaRegistro: new Date('2020-03-15'),
    rol: {
      idRol: 3,
      nombre: 'Paciente'
    }
  };

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
    totalCitas: 12,
    totalProcedimientos: 3,
    totalExamenes: 5,
    especialistasVisitados: 4
  };

  registrosRecientes: RegistroReciente[] = [
    {
      id: 1,
      fecha: new Date('2023-05-15'),
      titulo: 'Consulta de Cardiología',
      especialidad: 'Cardiología',
      medico: 'Carlos Mendoza'
    },
    {
      id: 2,
      fecha: new Date('2023-04-22'),
      titulo: 'Examen de sangre completo',
      especialidad: 'Laboratorio'
    },
    {
      id: 3,
      fecha: new Date('2023-03-10'),
      titulo: 'Extracción de lunar',
      especialidad: 'Dermatología',
      medico: 'Laura Fernández'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  cambiarSeccion(seccion: string): void {
    this.seccionActual = seccion;
  }

  actualizarInformacion(): void {
    console.log('Información actualizada:', this.usuario);
  }

  cancelarEdicion(): void {
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
