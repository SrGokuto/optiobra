import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Perfil } from './pages/perfil/perfil';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';
import { AvanceObraComponent } from './pages/avance-obra/avance-obra';
import { Trabajadores } from './pages/trabajadores/trabajadores';
import { Tareas } from './pages/tareas/tareas';
import { Calendario } from './pages/calendario/calendario';
import { RegisterComponent } from './components/register/register';
import { Usuarios } from './pages/usuarios/usuarios';
import { Configuracion } from './pages/configuracion/configuracion';
import { ReportesComponent } from './pages/reportes/reportes';
import { IaComponent } from './pages/ia/ia';
import { authGuard, guestGuard, rolGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
    title: 'OptiObra',
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
    canActivate: [rolGuard(['obrero', 'arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Materiales',
  },
  {
    path: 'proyectos',
    component: Proyectos,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Proyectos',
  },
  {
    path: 'avance-obra',
    component: AvanceObraComponent,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Avance de obra',
  },
  {
    path: 'trabajadores',
    component: Trabajadores,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Obreros',
  },
  {
    path: 'tareas',
    component: Tareas,
    canActivate: [rolGuard(['obrero', 'arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Tareas',
  },
  {
    path: 'calendario',
    component: Calendario,
    canActivate: [rolGuard(['obrero', 'arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Calendario',
  },
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Reportes',
  },
  {
    path: 'ia',
    component: IaComponent,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Inteligencia IA',
  },
  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Usuarios',
  },
  {
    path: 'configuracion',
    component: Configuracion,
    canActivate: [rolGuard(['arquitecto', 'maestro_obra', 'supervisor', 'ingeniero', 'admin'])],
    title: 'Configuración',
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard],
    title: 'Mi perfil',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
