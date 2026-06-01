import { Component, inject, ViewChild, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule
  ],
  template: `
    <div class="layout-container">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="brand">Carpool Route Optimizer</span>
        <span class="spacer"></span>
        <button mat-button (click)="authService.logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav [mode]="sidenavMode()" [opened]="sidenavOpened()" class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/profile" routerLinkActive="active-link" (click)="onNavLinkClick()">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Profile</span>
            </a>
            <a mat-list-item routerLink="/route-planner" routerLinkActive="active-link" (click)="onNavLinkClick()">
              <mat-icon matListItemIcon>directions_car</mat-icon>
              <span matListItemTitle>Route Planner</span>
            </a>
            <a mat-list-item routerLink="/weekly-route" routerLinkActive="active-link" (click)="onNavLinkClick()">
              <mat-icon matListItemIcon>calendar_month</mat-icon>
              <span matListItemTitle>Weekly Route</span>
            </a>
            <a mat-list-item routerLink="/postal-codes" routerLinkActive="active-link" (click)="onNavLinkClick()">
              <mat-icon matListItemIcon>location_on</mat-icon>
              <span matListItemTitle>Saved Postal Codes</span>
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
export class LayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly breakpointObserver = inject(BreakpointObserver);
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidenavMode = signal<'side' | 'over'>('side');
  sidenavOpened = signal(true);

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape]).subscribe(result => {
      if (result.matches) {
        this.sidenavMode.set('over');
        this.sidenavOpened.set(false);
      } else {
        this.sidenavMode.set('side');
        this.sidenavOpened.set(true);
      }
    });
  }

  onNavLinkClick(): void {
    if (this.sidenavMode() === 'over') {
      this.sidenav.close();
    }
  }
}
