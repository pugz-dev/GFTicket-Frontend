import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/public-home/public-home').then(m => m.PublicHome),
        pathMatch: 'full'
    },

    {
        path: 'eventos',
        redirectTo: '/',
        pathMatch: 'full'
    },

    {
        path: 'eventos/:id',
        loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetail)
    }
];


