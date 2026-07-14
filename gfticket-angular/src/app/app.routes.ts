import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'events',
        loadComponent: () => import('./pages/event-list/event-list').then(m => m.EventList)
    },

    {
        path: 'events/:id',
        loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetail)
    },

    {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
    }
];


