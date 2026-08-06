import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';
import { AvanceObra } from './pages/avance-obra/avance-obra';
import { Trabajadores } from './pages/trabajadores/trabajadores';
import { ReportesComponent } from './pages/reportes/reportes';

import { authGuard, guestGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    // TEMPORAL: iniciar la aplicación en Materiales mientras se desarrolla el frontend sin backend.
    redirectTo: 'trabajadores',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then(
        (m) => m.RegisterComponent
      ),
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [guestGuard],
    title: 'Registro',
  },
  {
    path: 'login',
    component: Login,
    // TEMPORAL: guestGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [guestGuard],
    title: 'Login',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [authGuard],
    title: 'Dashboard',
  },
  {
    path: 'materiales',
    component: Materiales,
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [authGuard],
    title: 'Materiales',
  },
  {
    path: 'proyectos',
    component: Proyectos,
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [authGuard],
    title: 'Proyectos',
  },
  {
    path: 'avance-obra',
    component: AvanceObra,
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [authGuard],
    title: 'Avance de obra',
  },
  {
    path: 'trabajadores',
    component: Trabajadores,
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [authGuard],
    title: 'Trabajadores',
  },
  {
    path: 'reportes',
    component: ReportesComponent,
    // TEMPORAL: authGuard deshabilitado para desarrollar la interfaz sin backend.
    // canActivate: [authGuard],
    title: 'Reportes',
  },
  {
    path: '**',
    // TEMPORAL: redirigir a Materiales mientras se desarrolla el frontend sin backend.
    redirectTo: 'trabajadore ',
  },
];