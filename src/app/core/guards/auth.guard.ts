import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function checkAuth(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Always verify token exists in localStorage, not just in memory
  const token = authService.getToken();
  if (token) {
    return true;
  }

  // Just redirect to login - no error message for first visit
  router.navigate(['/login']);
  return false;
}

export const authGuard: CanActivateFn = () => checkAuth();
export const authGuardChild: CanActivateChildFn = () => checkAuth();
