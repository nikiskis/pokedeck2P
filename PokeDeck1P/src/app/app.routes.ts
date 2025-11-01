import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout')
        .then(m => m.CheckoutComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile') 
        .then(m => m.ProfileComponent),
    canActivate: [authGuard] 
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart')
        .then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout')
        .then(m => m.CheckoutComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login') 
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register') 
        .then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile') 
        .then(m => m.ProfileComponent)
  },
  
  { path: '**', redirectTo: '' }
];