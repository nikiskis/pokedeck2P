import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'admin-products',
    loadComponent: () => import('./pages/admin-products/admin-products').then(m => m.AdminProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'legal',
    loadComponent: () => import('./pages/legal/legal').then(m => m.LegalComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductListComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  { path: '**', redirectTo: '' }
];