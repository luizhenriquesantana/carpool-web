import { Routes } from '@angular/router';
import { authGuard, authGuardChild } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'oauth-callback', loadComponent: () => import('./features/auth/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent) },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
    children: [
      { path: 'route-planner', loadComponent: () => import('./features/route-planner/route-planner.component').then(m => m.RoutePlannerComponent), canActivate: [authGuard] },
      { path: 'weekly-route', loadComponent: () => import('./features/weekly-route/weekly-route.component').then(m => m.WeeklyRouteComponent), canActivate: [authGuard] },
      { path: 'postal-codes', loadComponent: () => import('./features/postal-codes/postal-codes.component').then(m => m.PostalCodesComponent), canActivate: [authGuard] },
      { path: '', redirectTo: 'route-planner', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
