import { Routes } from '@angular/router';
import { Materiales } from './pages/materiales/materiales';
import { Login } from './pages/login/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'register',
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
    path: 'login',
    component: Login,
    title: 'Login'
  },
  {
    path: '**',
    redirectTo: 'register'
  }
];