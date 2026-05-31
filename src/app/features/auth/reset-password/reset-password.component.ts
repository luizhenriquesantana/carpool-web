import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="auth-icon">password</mat-icon>
            Set New Password
          </mat-card-title>
          <mat-card-subtitle>Enter your new password</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          @if (success()) {
            <div class="success-message">
              <mat-icon>check_circle</mat-icon>
              <p>{{ success() }}</p>
              <button mat-raised-button color="primary" routerLink="/login" class="mt-16">
                Go to Login
              </button>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="email" name="email" required type="email"
                       placeholder="your@email.com">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reset Token</mat-label>
                <input matInput [(ngModel)]="token" name="token" required
                       placeholder="Enter the token from your email">
                <mat-icon matSuffix>vpn_key</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Password</mat-label>
                <input matInput [(ngModel)]="newPassword" name="newPassword" required
                       [type]="hidePassword() ? 'password' : 'text'" minlength="6">
                <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm New Password</mat-label>
                <input matInput [(ngModel)]="confirmPassword" name="confirmPassword" required
                       [type]="hidePassword() ? 'password' : 'text'">
                <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              @if (passwordsDoNotMatch()) {
                <div class="error-text">Passwords do not match</div>
              }

              <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                      [disabled]="loading() || !email || !token || !newPassword || !confirmPassword || passwordsDoNotMatch()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Reset Password
                }
              </button>
            </form>
          }
        </mat-card-content>

        <mat-card-actions align="end">
          <a mat-button routerLink="/login">Back to Login</a>
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
    .error-text {
      color: #d32f2f;
      font-size: 12px;
      margin-top: -8px;
      margin-bottom: 16px;
    }
    .success-message {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      text-align: center;
    }
    .success-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    .mt-16 {
      margin-top: 16px;
    }
    mat-card-header {
      margin-bottom: 16px;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');
  success = signal('');
  hidePassword = signal(true);

  ngOnInit(): void {
    // Pre-fill email and token from query params if provided
    this.route.queryParams.subscribe(params => {
      if (params['email']) this.email = params['email'];
      if (params['token']) this.token = params['token'];
    });
  }

  passwordsDoNotMatch(): boolean {
    return this.newPassword !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  onSubmit(): void {
    if (!this.email || !this.token || !this.newPassword) return;
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Password reset successfully! You can now log in with your new password.');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Failed to reset password. Please try again.');
      }
    });
  }
}
