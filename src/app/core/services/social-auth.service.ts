import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private readonly platformId = inject(PLATFORM_ID);

  signInWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Redirect to backend's OAuth2 endpoint
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  signInWithGitHub(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Redirect to backend's OAuth2 endpoint
    window.location.href = `${environment.apiUrl}/oauth2/authorization/github`;
  }
}
