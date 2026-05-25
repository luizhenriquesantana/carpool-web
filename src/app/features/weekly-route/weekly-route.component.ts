import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';
import { RouteService } from '../../core/services/route.service';
import { DayRequest, MemberRequest, WeeklyRouteResponse } from '../../core/models/route.model';
import { COUNTRIES } from '../../core/constants/countries';

interface MemberForm {
  name: string;
  postalCode: string;
  canDrive: boolean;
}

interface DayForm {
  day: string;
  fixedDriverName: string;
  tripType: string;
  enabled: boolean;
}

@Component({
  selector: 'app-weekly-route',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatCheckboxModule, MatProgressSpinnerModule,
    MatDividerModule, MatExpansionModule, MatChipsModule,
    MatSnackBarModule, ClipboardModule
  ],
  template: `
    <div class="page-container">
      <h2>Weekly Route Planner</h2>
      <p class="subtitle">Plan a full week of carpool routes with fair driver rotation</p>

      <div class="form-grid">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Office & Country</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Country</mat-label>
                <mat-select [(ngModel)]="country">
                  @for (c of countries; track c.code) {
                    <mat-option [value]="c.code">{{ c.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
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
            <mat-card-title>Members</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (member of members; track $index) {
              <div class="member-row">
                <mat-form-field appearance="outline" class="member-field">
                  <mat-label>Name</mat-label>
                  <input matInput [(ngModel)]="member.name" [name]="'mname' + $index">
                </mat-form-field>
                <mat-form-field appearance="outline" class="member-field">
                  <mat-label>Postal Code</mat-label>
                  <input matInput [(ngModel)]="member.postalCode" [name]="'mpc' + $index">
                </mat-form-field>
                <mat-checkbox [(ngModel)]="member.canDrive" [name]="'mcd' + $index">
                  Can Drive
                </mat-checkbox>
                <button mat-icon-button color="warn" (click)="removeMember($index)"
                        [disabled]="members.length <= 2">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }

            <button mat-stroked-button (click)="addMember()" class="add-btn">
              <mat-icon>add</mat-icon> Add Member
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Days Configuration (Optional)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (day of days; track day.day) {
              <div class="day-row">
                <mat-checkbox [(ngModel)]="day.enabled" [name]="'de' + day.day">
                  {{ day.day }}
                </mat-checkbox>
                @if (day.enabled) {
                  <mat-form-field appearance="outline" class="day-field">
                    <mat-label>Fixed Driver</mat-label>
                    <input matInput [(ngModel)]="day.fixedDriverName" [name]="'dfd' + day.day"
                           placeholder="(auto-assign)">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="day-field">
                    <mat-label>Trip Type</mat-label>
                    <mat-select [(ngModel)]="day.tripType" [name]="'dtt' + day.day">
                      <mat-option value="">Default</mat-option>
                      <mat-option value="MORNING_TO_OFFICE">Morning to Office</mat-option>
                      <mat-option value="EVENING_TO_HOME">Evening to Home</mat-option>
                    </mat-select>
                  </mat-form-field>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="planWeeklyRoute()"
                [disabled]="loading() || !isFormValid()" class="plan-btn">
          @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>calendar_month</mat-icon> Plan Weekly Route
          }
        </button>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }

      @if (result()) {
        <mat-card class="result-card">
          <mat-card-header>
            <mat-card-title>Weekly Route Plan</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="driver-assignments">
              <h4>Driver Assignments</h4>
              <div class="chips-row">
                @for (entry of driverAssignmentEntries(); track entry[0]) {
                  <mat-chip-set>
                    <mat-chip>{{ entry[0] }}: {{ entry[1] }} day(s)</mat-chip>
                  </mat-chip-set>
                }
              </div>
            </div>

            <mat-divider></mat-divider>

            <mat-accordion>
              @for (day of result()!.days; track day.day) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>today</mat-icon>
                      {{ day.day }}
                    </mat-panel-title>
                    <mat-panel-description>
                      Driver: {{ day.driver.name }} |
                      {{ day.totalEstimatedKm | number:'1.1-1' }} km |
                      {{ day.totalEstimatedDurationMinutes }} min
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="day-detail">
                    <div class="share-actions">
                      <button mat-stroked-button color="primary" (click)="openDayGoogleMaps(day)">
                        <mat-icon>open_in_new</mat-icon> Open in Google Maps
                      </button>
                      <button mat-stroked-button (click)="copyDayGoogleMapsLink(day)">
                        <mat-icon>content_copy</mat-icon> Copy Link
                      </button>
                    </div>
                    <div class="stop-list">
                      <div class="stop-item driver">
                        <mat-icon>person</mat-icon>
                        <div>
                          <strong>1. {{ day.driver.name }}</strong>
                          <span class="stop-detail-text">{{ day.driver.postalCode }} (Driver)</span>
                        </div>
                      </div>

                      @for (stop of day.pickupOrder; track stop.id; let i = $index) {
                        <div class="stop-connector"><mat-icon>arrow_downward</mat-icon></div>
                        <div class="stop-item pickup">
                          <mat-icon>person_pin_circle</mat-icon>
                          <div>
                            <strong>{{ i + 2 }}. {{ stop.name }}</strong>
                            <span class="stop-detail-text">{{ stop.postalCode }}</span>
                          </div>
                        </div>
                      }

                      <div class="stop-connector"><mat-icon>arrow_downward</mat-icon></div>
                      <div class="stop-item office">
                        <mat-icon>business</mat-icon>
                        <div>
                          <strong>{{ day.pickupOrder.length + 2 }}. {{ result()!.office.name }}</strong>
                          <span class="stop-detail-text">{{ result()!.office.postalCode }} (Office)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
              }
            </mat-accordion>
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
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      align-items: center;
    }
    .member-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto 40px;
      gap: 8px;
      align-items: center;
    }
    .day-row {
      display: grid;
      grid-template-columns: 110px 1fr 1fr;
      gap: 16px;
      align-items: center;
      margin-bottom: 8px;
    }
    .add-btn { margin-top: 8px; }
    .actions { margin: 24px 0; text-align: center; }
    .plan-btn { height: 48px; font-size: 16px; padding: 0 32px; }
    .error-message {
      background: #fdecea; color: #611a15;
      padding: 12px; border-radius: 4px; margin-bottom: 16px;
    }
    .result-card { margin-top: 24px; }
    .driver-assignments { padding: 16px 0; }
    .chips-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .stop-list { padding: 8px 0; }
    .stop-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 8px; margin: 4px 0;
    }
    .stop-item.driver { background: #e3f2fd; }
    .stop-item.pickup { background: #f3e5f5; }
    .stop-item.office { background: #e8f5e9; }
    .stop-detail-text { display: block; color: #666; font-size: 13px; }
    .stop-connector {
      display: flex; justify-content: center;
      mat-icon { color: #999; }
    }
    mat-panel-title mat-icon { margin-right: 8px; }
    .share-actions {
      display: flex; gap: 12px; margin-bottom: 12px; justify-content: center;
    }
  `]
})
export class WeeklyRouteComponent {
  private readonly routeService = inject(RouteService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly clipboard = inject(Clipboard);

  countries = COUNTRIES;
  country = 'IE';
  officeName = '';
  officePostalCode = '';
  members: MemberForm[] = [
    { name: '', postalCode: '', canDrive: true },
    { name: '', postalCode: '', canDrive: false }
  ];
  days: DayForm[] = [
    { day: 'Monday', fixedDriverName: '', tripType: '', enabled: true },
    { day: 'Tuesday', fixedDriverName: '', tripType: '', enabled: true },
    { day: 'Wednesday', fixedDriverName: '', tripType: '', enabled: true },
    { day: 'Thursday', fixedDriverName: '', tripType: '', enabled: true },
    { day: 'Friday', fixedDriverName: '', tripType: '', enabled: true }
  ];

  loading = signal(false);
  error = signal('');
  result = signal<WeeklyRouteResponse | null>(null);

  driverAssignmentEntries = signal<[string, number][]>([]);

  addMember(): void {
    this.members = [...this.members, { name: '', postalCode: '', canDrive: false }];
  }

  removeMember(index: number): void {
    this.members = this.members.filter((_, i) => i !== index);
  }

  private buildGoogleMapsUrlForDay(day: any): string | null {
    const office = this.result()?.office;
    if (!office) return null;
    const stops = [day.driver, ...day.pickupOrder, office];
    if (stops.length < 2) return null;
    const origin = `${stops[0].latitude},${stops[0].longitude}`;
    const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (stops.length > 2) {
      const waypoints = stops.slice(1, -1).map((s: any) => `${s.latitude},${s.longitude}`).join('|');
      url += `&waypoints=${waypoints}`;
    }
    return url;
  }

  openDayGoogleMaps(day: any): void {
    const url = this.buildGoogleMapsUrlForDay(day);
    if (url) window.open(url, '_blank');
  }

  copyDayGoogleMapsLink(day: any): void {
    const url = this.buildGoogleMapsUrlForDay(day);
    if (url) {
      this.clipboard.copy(url);
      this.snackBar.open('Link copied to clipboard!', 'Dismiss', { duration: 3000 });
    }
  }

  isFormValid(): boolean {
    return !!this.country && !!this.officeName && !!this.officePostalCode &&
           this.members.length >= 2 &&
           this.members.every(m => !!m.name && !!m.postalCode) &&
           this.members.some(m => m.canDrive);
  }

  planWeeklyRoute(): void {
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    const enabledDays = this.days.filter(d => d.enabled);
    const dayRequests: DayRequest[] | undefined = enabledDays.length > 0
      ? enabledDays.map(d => ({
          day: d.day,
          fixedDriverName: d.fixedDriverName || undefined,
          tripType: d.tripType || undefined
        }))
      : undefined;

    const memberRequests: MemberRequest[] = this.members.map(m => ({
      name: m.name,
      postalCode: m.postalCode,
      canDrive: m.canDrive
    }));

    this.routeService.planWeeklyRoute({
      country: this.country,
      officeName: this.officeName,
      officePostalCode: this.officePostalCode,
      members: memberRequests,
      days: dayRequests
    }).subscribe({
      next: (res) => {
        this.result.set(res);
        this.driverAssignmentEntries.set(
          Object.entries(res.driverAssignments) as [string, number][]
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || err.error?.message || 'Failed to plan weekly route.');
        this.loading.set(false);
      }
    });
  }
}
