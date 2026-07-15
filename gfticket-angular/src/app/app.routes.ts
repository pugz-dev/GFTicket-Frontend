import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'eventos',
        loadComponent: () => import('./pages/event-list/event-list').then(m => m.EventList)
    },

    {
        path: 'eventos/:id',
        loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetail)
    },

    {
        path: '',
        redirectTo: 'eventos',
        pathMatch: 'full'
    }
];


