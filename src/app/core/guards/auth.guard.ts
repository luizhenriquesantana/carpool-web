import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function checkAuth(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const token = authService.getToken();

  if (isPlatformBrowser(platformId)) {
    const localToken = localStorage.getItem('auth_token');

    // If token exists in memory but NOT in localStorage, session was invalidated
    if (token && !localToken) {
      router.navigate(['/login'], { queryParams: { error: 'session_invalid' } });
      return false;
    }

    // If token exists in localStorage but not in memory (page refresh), restore it
    if (!token && localToken) {
      authService.setToken(localToken);
      return true;
    }
  }

  if (token) {
    return true;
  }

  // Just redirect to login - no error message for first visit
  router.navigate(['/login']);
  return false;
}

export const authGuard: CanActivateFn = () => checkAuth();
export const authGuardChild: CanActivateChildFn = () => checkAuth();
