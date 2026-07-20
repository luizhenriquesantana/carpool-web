import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface ProfileResponse {
  email: string;
  displayName: string;
  provider: string;
  memberSince: string;
  lastLogin: string;
  hasLocalPassword: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="profile-icon">person</mat-icon>
            Profile
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            @if (error()) {
              <div class="error-message">{{ error() }}</div>
            }

            @if (success()) {
              <div class="success-message">{{ success() }}</div>
            }

            <div class="profile-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput [value]="email()" disabled>
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>
            </div>

            <div class="profile-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Display Name</mat-label>
                <input matInput [(ngModel)]="displayName" name="displayName" required>
                <mat-icon matSuffix>edit</mat-icon>
              </mat-form-field>
            </div>

            <div class="profile-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Provider</mat-label>
                <input matInput [value]="provider()" disabled>
                <mat-icon matSuffix>login</mat-icon>
              </mat-form-field>
            </div>

            <div class="profile-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Member Since</mat-label>
                <input matInput [value]="memberSince()" disabled>
                <mat-icon matSuffix>calendar_today</mat-icon>
              </mat-form-field>
            </div>

            <div class="profile-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Last Login</mat-label>
                <input matInput [value]="lastLogin()" disabled>
                <mat-icon matSuffix>schedule</mat-icon>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" class="save-btn"
                    [disabled]="saving() || !displayName"
                    (click)="saveProfile()">
              @if (saving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              @if (!saving()) {
                <span>Save Changes</span>
              }
            </button>

            @if (showSecuritySection()) {
              <mat-divider class="divider"></mat-divider>

              <h3>Security</h3>

              @if (hasLocalPassword()) {
                <button mat-stroked-button color="accent" class="change-password-btn"
                        (click)="showChangePassword = true">
                  <mat-icon>lock</mat-icon>
                  Change Password
                </button>
              } @else {
                <p class="oauth-password-info">
                  <mat-icon>info</mat-icon>
                  You signed up with {{ provider() }}. You can add a local password to log in either way.
                </p>
                <button mat-stroked-button color="accent" class="change-password-btn"
                        (click)="goToSetPassword()">
                  <mat-icon>add</mat-icon>
                  Set Local Password
                </button>
              }

              @if (showChangePassword) {
                <div class="change-password-section">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input matInput [(ngModel)]="currentPassword" name="currentPassword" required
                           [type]="hidePassword() ? 'password' : 'text'">
                    <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                      <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
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

                  @if (passwordError()) {
                    <div class="error-message">{{ passwordError() }}</div>
                  }

                  @if (passwordSuccess()) {
                    <div class="success-message">{{ passwordSuccess() }}</div>
                  }

                  <div class="change-password-actions">
                    <button mat-button (click)="showChangePassword = false">Cancel</button>
                    <button mat-raised-button color="primary"
                            [disabled]="!currentPassword || !newPassword || !confirmPassword || changingPassword()"
                            (click)="changePassword()">
                      @if (changingPassword()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        Update Password
                      }
                    </button>
                  </div>
                </div>
              }
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .profile-card {
      width: 100%;
      max-width: 500px;
    }
    .profile-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      margin-right: 8px;
      vertical-align: middle;
    }
    .full-width {
      width: 100%;
    }
    .profile-field {
      margin-bottom: 8px;
    }
    .save-btn {
      margin-top: 16px;
      height: 48px;
      width: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
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
      color: #1b5e20;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .divider {
      margin: 24px 0;
    }
    .change-password-btn {
      width: 100%;
      height: 48px;
      margin-top: 8px;
    }
    .change-password-section {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .change-password-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .oauth-password-info {
      background: #e3f2fd;
      color: #1565c0;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .oauth-password-info mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    h3 {
      margin: 0 0 16px 0;
      color: #333;
    }
    mat-card-header {
      margin-bottom: 16px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  email = signal('');
  displayName = '';
  provider = signal('');
  memberSince = signal('');
  lastLogin = signal('');
  hasLocalPassword = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  // Password change fields
  showChangePassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  hidePassword = signal(true);
  changingPassword = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');

  showSecuritySection(): boolean {
    return this.isLocalUser() || !this.hasLocalPassword();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set('');

    this.http.get<ProfileResponse>(`${environment.apiUrl}/api/auth/profile`).subscribe({
      next: (profile) => {
        this.email.set(profile.email);
        this.displayName = profile.displayName;
        this.provider.set(this.capitalize(profile.provider));
        this.memberSince.set(this.formatDate(profile.memberSince));
        this.lastLogin.set(this.formatDate(profile.lastLogin));
        this.hasLocalPassword.set(profile.hasLocalPassword);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Failed to load profile.');
      }
    });
  }

  saveProfile(): void {
    if (!this.displayName || this.displayName.trim() === '') {
      this.error.set('Display name is required.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.http.put(`${environment.apiUrl}/api/auth/profile`, { displayName: this.displayName.trim() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Profile updated successfully!');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.error || 'Failed to update profile.');
      }
    });
  }

  isLocalUser(): boolean {
    return this.provider().toLowerCase() === 'Local' || this.provider().toLowerCase() === 'local';
  }

  goToSetPassword(): void {
    // Navigate to forgot-password with email pre-filled
    this.router.navigate(['/forgot-password'], { 
      queryParams: { email: this.email() } 
    });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError.set('All fields are required.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('Password must be at least 6 characters.');
      return;
    }

    this.changingPassword.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');

    this.http.post(`${environment.apiUrl}/api/auth/change-password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSuccess.set('Password changed successfully!');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.showChangePassword = false;
          this.passwordSuccess.set('');
        }, 3000);
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.passwordError.set(err.error?.error || 'Failed to change password.');
      }
    });
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
