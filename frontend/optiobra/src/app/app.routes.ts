import { Routes } from '@angular/router';
import { Materiales } from './pages/materiales/materiales';
import { Login } from './pages/login/login';
import { authGuard, guestGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Registro',
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
    title: 'Login',
  },
  {
    path: 'materiales',
    component: Materiales,
    canActivate: [authGuard],
    title: 'Materiales',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
