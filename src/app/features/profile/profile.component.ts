import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface ProfileResponse {
  email: string;
  displayName: string;
  provider: string;
  memberSince: string;
  lastLogin: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
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
                Save Changes
              }
            </button>
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
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

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
