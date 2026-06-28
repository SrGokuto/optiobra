import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Materiales } from './pages/materiales/materiales';
import { Proyectos } from './pages/proyectos/proyectos';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'materiales', component: Materiales },
  { path: 'proyectos', component: Proyectos }
];



