import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, SocialLoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenSignal = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly token = computed(() => this.tokenSignal());

  private storageCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        this.tokenSignal.set(stored);
      }
      // Listen for localStorage changes from OTHER tabs
      window.addEventListener('storage', (event) => {
        if (event.key === 'auth_token' && event.newValue === null) {
          this.handleSessionInvalid();
        }
      });
      // Poll localStorage every 500ms to detect "Clear site data" in the same tab
      this.storageCheckInterval = setInterval(() => {
        const hasMemoryToken = !!this.tokenSignal();
        const hasStorageToken = !!localStorage.getItem('auth_token');
        if (hasMemoryToken && !hasStorageToken) {
          // localStorage was cleared but signal still has token
          this.handleSessionInvalid();
        }
      }, 500);
      // Also check when user returns to the tab
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          const hasMemoryToken = !!this.tokenSignal();
          const hasStorageToken = !!localStorage.getItem('auth_token');
          if (hasMemoryToken && !hasStorageToken) {
            this.handleSessionInvalid();
          }
        }
      });
    }
  }

  private handleSessionInvalid(): void {
    this.tokenSignal.set(null);
    this.router.navigate(['/login'], { queryParams: { error: 'session_invalid' } });
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, request).pipe(
      tap(res => this.storeToken(res.token))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, request).pipe(
      tap(res => this.storeToken(res.token))
    );
  }

  socialLogin(request: SocialLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/social-login`, request).pipe(
      tap(res => this.storeToken(res.token))
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/api/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.clearAuthData();
      },
      error: () => {
        // Even if logout fails, clear local token
        this.clearAuthData();
      }
    });
  }

  private clearAuthData(): void {
    if (this.storageCheckInterval) {
      clearInterval(this.storageCheckInterval);
      this.storageCheckInterval = null;
    }
    this.tokenSignal.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      // Clear all cookies including session cookies to ensure clean state for next OAuth2 login
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        // Clear cookie for all paths and domains
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        // Also try clearing for parent domain
        const domainParts = window.location.hostname.split('.');
        if (domainParts.length > 2) {
          const parentDomain = domainParts.slice(1).join('.');
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + parentDomain;
        }
      });
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  setToken(token: string): void {
    this.tokenSignal.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  private storeToken(token: string): void {
    this.tokenSignal.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }
}
