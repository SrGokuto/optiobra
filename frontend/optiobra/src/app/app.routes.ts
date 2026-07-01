import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';

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
      import('./components/register/register').then(
        (m) => m.RegisterComponent
      ),
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
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    title: 'Dashboard',
  },
  {
    path: 'materiales',
    component: Materiales,
    canActivate: [authGuard],
    title: 'Materiales',
  },
  {
    path: 'proyectos',
    component: Proyectos,
    canActivate: [authGuard],
    title: 'Proyectos',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];