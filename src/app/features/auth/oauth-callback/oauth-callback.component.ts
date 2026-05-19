import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <p>Processing OAuth callback...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 18px;
    }
  `]
})
export class OAuthCallbackComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.handleCallback();
    }
  }

  private handleCallback(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      // Store the JWT token
      this.authService['storeToken'](token);
      // Redirect to route planner
      this.router.navigate(['/route-planner']);
    } else {
      // No token, redirect to login
      this.router.navigate(['/login']);
    }
  }
}
