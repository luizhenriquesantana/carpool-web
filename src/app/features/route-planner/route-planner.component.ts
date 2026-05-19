import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { RouteService } from '../../core/services/route.service';
import { ColleagueRequest, RouteResponse } from '../../core/models/route.model';

@Component({
  selector: 'app-route-planner',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <h2>Single Route Planner</h2>
      <p class="subtitle">Plan an optimized carpool route with pickup order</p>

      <div class="form-grid">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Route Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Country</mat-label>
                <input matInput [(ngModel)]="country" placeholder="e.g. Ireland">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Trip Type</mat-label>
                <mat-select [(ngModel)]="tripType">
                  <mat-option value="MORNING_TO_OFFICE">Morning to Office</mat-option>
                  <mat-option value="EVENING_TO_HOME">Evening to Home</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Driver Name</mat-label>
                <input matInput [(ngModel)]="driverName">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Driver Postal Code</mat-label>
                <input matInput [(ngModel)]="driverPostalCode">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Office Name</mat-label>
                <input matInput [(ngModel)]="officeName">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Office Postal Code</mat-label>
                <input matInput [(ngModel)]="officePostalCode">
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Colleagues</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (colleague of colleagues; track $index) {
              <div class="colleague-row">
                <mat-form-field appearance="outline" class="colleague-field">
                  <mat-label>Name</mat-label>
                  <input matInput [(ngModel)]="colleague.name" [name]="'cname' + $index">
                </mat-form-field>
                <mat-form-field appearance="outline" class="colleague-field">
                  <mat-label>Postal Code</mat-label>
                  <input matInput [(ngModel)]="colleague.postalCode" [name]="'cpc' + $index">
                </mat-form-field>
                <button mat-icon-button color="warn" (click)="removeColleague($index)"
                        [disabled]="colleagues.length <= 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }

            <button mat-stroked-button (click)="addColleague()" class="add-btn">
              <mat-icon>add</mat-icon> Add Colleague
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="planRoute()"
                [disabled]="loading() || !isFormValid()" class="plan-btn">
          @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>route</mat-icon> Plan Route
          }
        </button>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }

      @if (result()) {
        <mat-card class="result-card">
          <mat-card-header>
            <mat-card-title>Optimized Route</mat-card-title>
            <mat-card-subtitle>
              {{ result()!.tripType === 'MORNING_TO_OFFICE' ? 'Morning to Office' : 'Evening to Home' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-row">
              <div class="stat">
                <mat-icon>straighten</mat-icon>
                <div>
                  <span class="stat-value">{{ result()!.totalEstimatedKm | number:'1.1-1' }} km</span>
                  <span class="stat-label">Total Distance</span>
                </div>
              </div>
              <div class="stat">
                <mat-icon>schedule</mat-icon>
                <div>
                  <span class="stat-value">{{ result()!.totalEstimatedDurationMinutes }} min</span>
                  <span class="stat-label">Estimated Duration</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="route-stops">
              <h4>Route Order</h4>
              <div class="stop-list">
                <div class="stop-item driver">
                  <mat-icon>person</mat-icon>
                  <div>
                    <strong>{{ result()!.driver.name }}</strong>
                    <span class="stop-detail">{{ result()!.driver.postalCode }} (Driver Start)</span>
                  </div>
                </div>

                @for (stop of result()!.pickupOrder; track stop.id; let i = $index) {
                  <div class="stop-connector">
                    <mat-icon>arrow_downward</mat-icon>
                  </div>
                  <div class="stop-item pickup">
                    <mat-icon>person_pin_circle</mat-icon>
                    <div>
                      <strong>{{ i + 1 }}. {{ stop.name }}</strong>
                      <span class="stop-detail">{{ stop.postalCode }}</span>
                    </div>
                  </div>
                }

                <div class="stop-connector">
                  <mat-icon>arrow_downward</mat-icon>
                </div>
                <div class="stop-item office">
                  <mat-icon>business</mat-icon>
                  <div>
                    <strong>{{ result()!.office.name }}</strong>
                    <span class="stop-detail">{{ result()!.office.postalCode }} (Destination)</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; }
    .subtitle { color: #666; margin-bottom: 24px; }
    .form-grid { display: flex; flex-direction: column; gap: 16px; }
    .form-card { margin-bottom: 8px; }
    .form-row {
      display: flex; gap: 16px;
      mat-form-field { flex: 1; }
    }
    .colleague-row {
      display: flex; gap: 8px; align-items: center;
    }
    .colleague-field { flex: 1; }
    .add-btn { margin-top: 8px; }
    .actions { margin: 24px 0; text-align: center; }
    .plan-btn { height: 48px; font-size: 16px; padding: 0 32px; }
    .error-message {
      background: #fdecea; color: #611a15;
      padding: 12px; border-radius: 4px; margin-bottom: 16px;
    }
    .result-card { margin-top: 24px; }
    .stats-row {
      display: flex; gap: 32px; padding: 16px 0;
    }
    .stat {
      display: flex; align-items: center; gap: 12px;
      mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1976d2; }
    }
    .stat-value { display: block; font-size: 24px; font-weight: 500; }
    .stat-label { display: block; color: #666; font-size: 13px; }
    .route-stops { padding-top: 16px; }
    .stop-list { padding: 8px 0; }
    .stop-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 8px; margin: 4px 0;
    }
    .stop-item.driver { background: #e3f2fd; }
    .stop-item.pickup { background: #f3e5f5; }
    .stop-item.office { background: #e8f5e9; }
    .stop-detail { display: block; color: #666; font-size: 13px; }
    .stop-connector {
      display: flex; justify-content: center;
      mat-icon { color: #999; }
    }
  `]
})
export class RoutePlannerComponent {
  private readonly routeService = inject(RouteService);

  country = 'Ireland';
  driverName = '';
  driverPostalCode = '';
  officeName = '';
  officePostalCode = '';
  tripType = 'MORNING_TO_OFFICE';
  colleagues: ColleagueRequest[] = [{ name: '', postalCode: '' }];

  loading = signal(false);
  error = signal('');
  result = signal<RouteResponse | null>(null);

  addColleague(): void {
    this.colleagues = [...this.colleagues, { name: '', postalCode: '' }];
  }

  removeColleague(index: number): void {
    this.colleagues = this.colleagues.filter((_, i) => i !== index);
  }

  isFormValid(): boolean {
    return !!this.country && !!this.driverName && !!this.driverPostalCode &&
           !!this.officeName && !!this.officePostalCode &&
           this.colleagues.length > 0 &&
           this.colleagues.every(c => !!c.name && !!c.postalCode);
  }

  planRoute(): void {
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.routeService.planRoute({
      country: this.country,
      driverName: this.driverName,
      driverPostalCode: this.driverPostalCode,
      officeName: this.officeName,
      officePostalCode: this.officePostalCode,
      tripType: this.tripType,
      colleagues: this.colleagues
    }).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || err.error?.message || 'Failed to plan route.');
        this.loading.set(false);
      }
    });
  }
}
