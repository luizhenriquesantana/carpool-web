import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule
  ],
  template: `
    <div class="layout-container">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="brand">Carpool Route Optimizer</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="authService.logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/route-planner" routerLinkActive="active-link">
              <mat-icon matListItemIcon>directions_car</mat-icon>
              <span matListItemTitle>Route Planner</span>
            </a>
            <a mat-list-item routerLink="/weekly-route" routerLinkActive="active-link">
              <mat-icon matListItemIcon>calendar_month</mat-icon>
              <span matListItemTitle>Weekly Route</span>
            </a>
            <a mat-list-item routerLink="/postal-codes" routerLinkActive="active-link">
              <mat-icon matListItemIcon>location_on</mat-icon>
              <span matListItemTitle>Saved Postal Codes</span>
            </a>
            <a mat-list-item routerLink="/profile" routerLinkActive="active-link">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Profile</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .brand {
      margin-left: 8px;
      font-size: 18px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .sidenav-container {
      flex: 1;
    }
    .sidenav {
      width: 240px;
    }
    .content {
      padding: 24px;
    }
    .active-link {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class LayoutComponent {
  readonly authService = inject(AuthService);
  @ViewChild('sidenav') sidenav!: MatSidenav;
}
