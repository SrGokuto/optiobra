import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'register',
        pathMatch: 'full'
    },

  
    {
        path: 'register',
        loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent),
        title: 'Register'
    },
    {
        path: '**',
        redirectTo: 'register'
    }
];
