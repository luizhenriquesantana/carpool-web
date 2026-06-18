import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { SocialAuthService } from '../../../core/services/social-auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="auth-icon">directions_car</mat-icon>
            Sign In
          </mat-card-title>
          <mat-card-subtitle>Carpool Route Optimizer</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <div class="social-buttons">
            <button mat-stroked-button class="social-btn google-btn" (click)="signInWithGoogle()"
                    [disabled]="socialLoading()">
              @if (socialLoading() && currentProvider() === 'google') {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <svg class="btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.19 3.32v2.77h3.54c2.07-1.91 3.26-4.73 3.26-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.77c-.98.66-2.23 1.06-3.74 1.06-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              }
            </button>

            <button mat-stroked-button class="social-btn github-btn" (click)="signInWithGitHub()"
                    [disabled]="socialLoading()">
              @if (socialLoading() && currentProvider() === 'github') {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <svg class="btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>Sign in with GitHub</span>
              }
            </button>
          </div>

          <div class="divider">
            <span>or</span>
          </div>

          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="username" name="username" required autocomplete="username">
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [(ngModel)]="password" name="password" required
                     [type]="hidePassword() ? 'password' : 'text'" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                    [disabled]="loading() || !username || !password">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <a mat-button routerLink="/forgot-password">Forgot Password?</a>
          <a mat-button routerLink="/register">Don't have an account? Register</a>
        </mat-card-actions>
      </mat-card>
      
      <footer class="auth-footer">
        <a href="https://santana.ie" target="_blank" rel="noopener noreferrer" class="footer-link">
          Powered by Santana
        </a>
      </footer>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
    }
    .auth-card {
      width: 400px;
      padding: 24px;
    }
    .auth-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      margin-right: 8px;
      vertical-align: middle;
    }
    .full-width {
      width: 100%;
    }
    .submit-btn {
      margin-top: 8px;
      height: 48px;
    }
    .error-message {
      background: #fdecea;
      color: #611a15;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    mat-card-header {
      margin-bottom: 16px;
    }
    .social-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    .social-btn {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .google-btn {
      color: #757575;
      border-color: #ddd;
    }
    .github-btn {
      color: #24292e;
      border-color: #ddd;
    }
    .divider {
      display: flex;
      align-items: center;
      margin: 20px 0;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .divider span {
      padding: 0 12px;
    }
    .auth-footer {
      margin-top: auto;
      text-align: center;
      padding-top: 24px;
    }
    .footer-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .footer-link:hover {
      color: white;
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly socialAuthService = inject(SocialAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  loading = signal(false);
  socialLoading = signal(false);
  currentProvider = signal<'google' | 'github' | 'google-signup' | 'github-signup' | null>(null);
  error = signal('');
  hidePassword = signal(true);

  ngOnInit(): void {
    // Check if redirected due to invalid session
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'session_invalid') {
        this.error.set('Your session is invalid. Please log in again.');
      }
    });
  }

  signInWithGoogle(): void {
    this.socialAuthService.signInWithGoogle();
  }

  signInWithGitHub(): void {
    this.socialAuthService.signInWithGitHub();
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/route-planner']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Login failed. Please try again.');
      }
    });
  }
}
