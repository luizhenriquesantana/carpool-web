import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Check if token exists in localStorage (not just in memory)
  // If user cleared site data, localStorage will be empty
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (token && !storedToken) {
    // Token was cleared from localStorage but still in memory (e.g., "Clear site data")
    authService.logout();
    router.navigate(['/login'], { queryParams: { error: 'session_invalid' } });
    return throwError(() => new Error('Session expired'));
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned).pipe(
      catchError(error => {
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login'], { queryParams: { error: 'session_invalid' } });
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
