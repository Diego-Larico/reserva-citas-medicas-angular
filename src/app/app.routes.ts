import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MisCitasComponent } from './pages/mis-citas/mis-citas.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'citas', component: MisCitasComponent },
      { path: '', redirectTo: 'citas', pathMatch: 'full' }
    ]
  }
];
