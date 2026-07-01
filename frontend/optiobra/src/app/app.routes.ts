import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';
import { AvanceObraComponent } from './pages/avance-obra/avance-obra';
import { Trabajadores } from './pages/trabajadores/trabajadores';

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
    path: 'avance-obra',
    component: AvanceObraComponent,
    canActivate: [authGuard],
    title: 'Avance de obra',
  },
  {
    path: 'trabajadores',
    component: Trabajadores,
    canActivate: [authGuard],
    title: 'Trabajadores',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];