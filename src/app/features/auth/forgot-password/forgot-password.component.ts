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

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="auth-icon">lock_reset</mat-icon>
            Reset Password
          </mat-card-title>
          <mat-card-subtitle>Enter your email to receive a reset link</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          @if (success()) {
            <div class="success-message">
              <mat-icon>check_circle</mat-icon>
              <p>{{ success() }}</p>
              <p class="hint">Please check your email inbox (and spam folder) for the reset link.</p>
              <button mat-button color="primary" routerLink="/login">
                Back to Login
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

              <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                      [disabled]="loading() || !email">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Send Reset Link
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
    .hint {
      font-size: 12px;
      color: #666;
      margin: 12px 0;
    }
    mat-card-header {
      margin-bottom: 16px;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  email = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit(): void {
    // Pre-fill email from query params if provided
    this.route.queryParams.subscribe(params => {
      if (params['email']) this.email = params['email'];
    });
  }

  onSubmit(): void {
    if (!this.email) return;

    this.loading.set(true);
    this.error.set('');

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message || 'A reset link has been sent to your email.');
      },
      error: (err) => {
        this.loading.set(false);
        // Still show success message even on error to not reveal if email exists
        this.success.set('If an account with that email exists, a reset link has been sent.');
      }
    });
  }
}
