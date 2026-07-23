import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'eventos',
        redirectTo: '/',
        pathMatch: 'full'
    },

    {
        path: '',
        loadComponent: () => import('./pages/public-home/public-home').then(m => m.PublicHome),
        pathMatch: 'full'
    },

    {
        path: 'eventos/:id',
        loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetail)
    },

    {
        path: 'registro',
        loadComponent: () => import('./pages/register/register').then(m => m.Register)
    },

    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },

    {
        path: 'recuperar-contrasena',
        loadComponent: () => import('./pages/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena)
    },

    {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil),
        canActivate: [authGuard]
    },

    {
        path: 'carrito/:id',
        loadComponent: () => import('./pages/cart/cart').then(m => m.Cart),
        canActivate: [authGuard]
    },

    {
        path: 'confirmacion',
        loadComponent: () => import('./pages/confirmation-purchase/confirmation-purchase').then(m => m.ConfirmationPurchase)
    },

    {
        path: 'mis-entradas',
        loadComponent: () => import('./pages/mis-entradas/mis-entradas').then(m => m.MisEntradas),
    }
];


