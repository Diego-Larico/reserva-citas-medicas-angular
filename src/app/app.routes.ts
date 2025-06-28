import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MisCitasComponent } from './pages/mis-citas/mis-citas.component';
import { NuevaCitaComponent } from './pages/nueva-cita/nueva-cita.component';
import { MedicosComponent } from './pages/medicos/medicos.component';
import { HitorialComponent } from './pages/hitorial/hitorial.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'citas', component: MisCitasComponent },
      { path: 'nueva-cita', component: NuevaCitaComponent },
      { path: 'medicos', component: MedicosComponent },
      { path: 'historial', component: HitorialComponent },
      { path: '', redirectTo: 'citas', pathMatch: 'full' }
    ]
  }
];
