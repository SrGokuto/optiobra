import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';
import { AvanceObraComponent } from './pages/avance-obra/avance-obra';
import { Trabajadores } from './pages/trabajadores/trabajadores';
import { RegisterComponent } from './components/register/register';
import { Usuarios } from './pages/usuarios/usuarios';
import { Configuracion } from './pages/configuracion/configuracion';
import { ReportesComponent } from './pages/reportes/reportes';
import { authGuard, guestGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'trabajadores',
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
    component: AvanceObraComponent,
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
    path: 'usuarios',
    component: Usuarios,
    canActivate: [authGuard],
    title: 'Usuarios',
  },
  {
    path: 'configuracion',
    component: Configuracion,
    canActivate: [authGuard],
    title: 'Configuración',
  },
  {
    path: '**',
    redirectTo: 'trabajadores',
  },
];
