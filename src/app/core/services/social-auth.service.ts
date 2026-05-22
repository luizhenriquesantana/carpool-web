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

    // Clear cookies before OAuth2 redirect to prevent session state interference
    this.clearCookies();

    // Redirect to backend's OAuth2 endpoint
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  signInWithGitHub(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Clear cookies before OAuth2 redirect to prevent session state interference
    this.clearCookies();

    // Redirect to backend's OAuth2 endpoint
    window.location.href = `${environment.apiUrl}/oauth2/authorization/github`;
  }

  private clearCookies(): void {
    // Clear all cookies to ensure clean OAuth2 state
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
}
