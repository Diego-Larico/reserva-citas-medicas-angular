import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', component: AppComponent }
];
