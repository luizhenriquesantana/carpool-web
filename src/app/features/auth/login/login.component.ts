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
                <mat-icon class="btn-icon">google</mat-icon>
                <span>Sign in with Google</span>
              }
            </button>

            <button mat-stroked-button class="social-btn github-btn" (click)="signInWithGitHub()"
                    [disabled]="socialLoading()">
              @if (socialLoading() && currentProvider() === 'github') {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon class="btn-icon">github</mat-icon>
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
          <a mat-button routerLink="/register">Don't have an account? Register</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  currentProvider = signal<'google' | 'github' | null>(null);
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
