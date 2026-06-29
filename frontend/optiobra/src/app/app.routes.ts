import { Routes } from '@angular/router';
<<<<<<< Updated upstream

export const routes: Routes = [];
=======
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';
import { RegisterComponent } from './components/register/register';
import { authGuard, guestGuard } from '../guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Login, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'materiales', component: Materiales, canActivate: [authGuard] },
  { path: 'proyectos', component: Proyectos, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
>>>>>>> Stashed changes
