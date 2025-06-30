import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MisCitasComponent } from './pages/mis-citas/mis-citas.component';
import { NuevaCitaComponent } from './pages/nueva-cita/nueva-cita.component';
import { MedicosComponent } from './pages/medicos/medicos.component';
import { HitorialComponent } from './pages/hitorial/hitorial.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';
import { MiAgendaMedicoComponent } from './pages/mi-agenda-medico/mi-agenda-medico.component';
import { MisPacientesMedicoComponent } from './pages/mis-pacientes-medico/mis-pacientes-medico.component';
import { HistorialesMedicosMedicoComponent } from './pages/historiales-medicos-medico/historiales-medicos-medico.component';
import { GestionarUsuariosAdminComponent } from './pages/gestionar-usuarios-admin/gestionar-usuarios-admin.component';
import { GestionarEspecialidadesAdminComponent } from './pages/gestionar-especialidades-admin/gestionar-especialidades-admin.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'citas', component: MisCitasComponent },
      { path: 'nueva-cita', component: NuevaCitaComponent },
      { path: 'medicos', component: MedicosComponent },
      { path: 'historial', component: HitorialComponent },
      { path: 'perfil', component: MiPerfilComponent },
      { path: 'agenda', component: MiAgendaMedicoComponent },
      { path: 'pacientes', component: MisPacientesMedicoComponent },
      { path: 'historiales', component: HistorialesMedicosMedicoComponent },
      { path: 'gestionar-usuarios', component: GestionarUsuariosAdminComponent },
      { path: 'gestionar-especialidades', component: GestionarEspecialidadesAdminComponent },
      // Redirección condicional según el rol
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '', // Este valor se ajustará dinámicamente en el DashboardComponent
        data: { dynamicRedirect: true }
      }
    ]
  }
];
