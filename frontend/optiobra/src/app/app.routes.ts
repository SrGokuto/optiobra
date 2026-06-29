import { Routes } from '@angular/router';
import { Materiales } from './pages/materiales/materiales';
import { Login } from './pages/login/login';
import { AvanceObra } from './pages/avance-obra/avance-obra';
import { Trabajadores } from './pages/trabajadores/trabajadores';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'avance-obra',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then(
        m => m.RegisterComponent
      ),
    title: 'Register'
  },
  {
    path: 'materiales',
    component: Materiales,
    title: 'Materiales'
  },
  {
    path: 'avance-obra',
    component: AvanceObra,
    title: 'Avance de obra'
  },
  {
    path: 'trabajadores',
    component: Trabajadores,
    title: 'Trabajadores'
  },
  {
    path: 'login',
    component: Login,
    title: 'Login'
  },
  {
    path: '**',
    redirectTo: 'trabajadores'
  }
];