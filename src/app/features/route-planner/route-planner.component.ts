import { Component, computed, inject, signal } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RouteService } from '../../core/services/route.service';
import { PostalCodeService } from '../../core/services/postal-code.service';
import { ColleagueRequest, RouteResponse, ApiStop } from '../../core/models/route.model';
import { SavedPostalCode } from '../../core/models/postal-code.model';
import { RouteMapComponent } from '../../shared/components/route-map/route-map.component';
import { COUNTRIES } from '../../core/constants/countries';

@Component({
  selector: 'app-route-planner',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule, MatChipsModule,
    MatTooltipModule, MatSnackBarModule, ClipboardModule, MatAutocompleteModule,
    RouteMapComponent
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
                <mat-select [(ngModel)]="country">
                  @for (c of countries; track c.code) {
                    <mat-option [value]="c.code">{{ c.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Trip Type</mat-label>
                <mat-select [(ngModel)]="tripType">
                  <mat-option value="MORNING_TO_OFFICE">Morning to Office</mat-option>
                  <mat-option value="EVENING_TO_HOME">Evening to Home</mat-option>
                </mat-select>
              </mat-form-field>
              <span style="width: 40px; display: inline-block;"></span>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Driver Name</mat-label>
                <input matInput [(ngModel)]="driverName"
                       [matAutocomplete]="auto"
                       (focus)="setActiveField('driver')"
                       (input)="updateFilter($event)">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Driver Postal Code</mat-label>
                <input matInput [(ngModel)]="driverPostalCode"
                       [matAutocomplete]="auto"
                       (focus)="setActiveField('driver')"
                       (input)="updateFilter($event)">
              </mat-form-field>
              <button mat-icon-button color="primary"
                      (click)="savePostalCode(driverName, driverPostalCode)"
                      [disabled]="!driverName || !driverPostalCode || isAlreadySaved(driverPostalCode)"
                      matTooltip="Save to Saved Postal Codes">
                <mat-icon>bookmark_add</mat-icon>
              </button>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Office Name</mat-label>
                <input matInput [(ngModel)]="officeName"
                       [matAutocomplete]="auto"
                       (focus)="setActiveField('office')"
                       (input)="updateFilter($event)">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Office Postal Code</mat-label>
                <input matInput [(ngModel)]="officePostalCode"
                       [matAutocomplete]="auto"
                       (focus)="setActiveField('office')"
                       (input)="updateFilter($event)">
              </mat-form-field>
              <button mat-icon-button color="primary"
                      (click)="savePostalCode(officeName, officePostalCode)"
                      [disabled]="!officeName || !officePostalCode || isAlreadySaved(officePostalCode)"
                      matTooltip="Save to Saved Postal Codes">
                <mat-icon>bookmark_add</mat-icon>
              </button>
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
                  <input matInput [(ngModel)]="colleague.name" [name]="'cname' + $index"
                         [matAutocomplete]="auto"
                         (focus)="setActiveField('colleague', $index)"
                         (input)="updateFilter($event)">
                </mat-form-field>
                <mat-form-field appearance="outline" class="colleague-field">
                  <mat-label>Postal Code</mat-label>
                  <input matInput [(ngModel)]="colleague.postalCode" [name]="'cpc' + $index"
                         [matAutocomplete]="auto"
                         (focus)="setActiveField('colleague', $index)"
                         (input)="updateFilter($event)">
                </mat-form-field>
                <button mat-icon-button color="primary"
                        (click)="savePostalCode(colleague.name, colleague.postalCode)"
                        [disabled]="!colleague.name || !colleague.postalCode || isAlreadySaved(colleague.postalCode)"
                        matTooltip="Save to Saved Postal Codes">
                  <mat-icon>bookmark_add</mat-icon>
                </button>
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

        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">
          @for (pc of filteredPostalCodes(); track pc.id) {
            <mat-option [value]="pc.postalCode">{{ pc.label }} — {{ pc.postalCode }}</mat-option>
          }
        </mat-autocomplete>
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
        <app-route-map [stops]="routeStops()"></app-route-map>

        @if (googleMapsUrl()) {
          <div class="share-actions">
            <button mat-stroked-button color="primary" (click)="openGoogleMaps()">
              <mat-icon>open_in_new</mat-icon> Open in Google Maps
            </button>
            <button mat-stroked-button (click)="copyGoogleMapsLink()">
              <mat-icon>content_copy</mat-icon> Copy Link
            </button>
          </div>
        }

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
                    <strong>1. {{ result()!.driver.name }}</strong>
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
                      <strong>{{ i + 2 }}. {{ stop.name }}</strong>
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
                    <strong>{{ result()!.pickupOrder.length + 2 }}. {{ result()!.office.name }}</strong>
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
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 16px;
      align-items: center;
    }
    .colleague-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto auto;
      gap: 8px;
      align-items: center;
    }
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
    .share-actions {
      display: flex; gap: 12px; margin-top: 16px; justify-content: center;
    }
  `]
})
export class RoutePlannerComponent {
  private readonly routeService = inject(RouteService);
  private readonly postalCodeService = inject(PostalCodeService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly clipboard = inject(Clipboard);

  savedPostalCodes = signal<SavedPostalCode[]>([]);
  autocompleteFilter = signal('');
  activeFieldType = signal<'driver' | 'office' | 'colleague' | null>(null);
  activeFieldIndex = signal<number>(-1);

  filteredPostalCodes = computed(() => {
    const filter = this.autocompleteFilter().toLowerCase().trim();
    if (!filter) return this.savedPostalCodes();
    return this.savedPostalCodes().filter(pc =>
      pc.postalCode.toLowerCase().includes(filter) ||
      pc.label.toLowerCase().includes(filter)
    );
  });

  countries = COUNTRIES;
  country = 'IE';
  driverName = '';
  driverPostalCode = '';
  officeName = '';
  officePostalCode = '';
  tripType = 'MORNING_TO_OFFICE';
  colleagues: ColleagueRequest[] = [{ name: '', postalCode: '' }];

  loading = signal(false);
  error = signal('');
  result = signal<RouteResponse | null>(null);

  routeStops = computed<ApiStop[]>(() => {
    const res = this.result();
    if (!res) return [];
    return [res.driver, ...res.pickupOrder, res.office];
  });

  googleMapsUrl = computed<string | null>(() => {
    const stops = this.routeStops();
    if (stops.length < 2) return null;
    const origin = `${stops[0].latitude},${stops[0].longitude}`;
    const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (stops.length > 2) {
      const waypoints = stops.slice(1, -1).map(s => `${s.latitude},${s.longitude}`).join('|');
      url += `&waypoints=${waypoints}`;
    }
    return url;
  });

  constructor() {
    this.loadSavedPostalCodes();
  }

  loadSavedPostalCodes(): void {
    this.postalCodeService.list().subscribe({
      next: (codes) => this.savedPostalCodes.set(codes),
      error: () => this.savedPostalCodes.set([])
    });
  }

  setActiveField(type: 'driver' | 'office' | 'colleague', index: number = -1): void {
    this.activeFieldType.set(type);
    this.activeFieldIndex.set(index);
  }

  updateFilter(event: Event): void {
    this.autocompleteFilter.set((event.target as HTMLInputElement).value);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const postalCode = event.option.value as string;
    const pc = this.savedPostalCodes().find(p => p.postalCode === postalCode);
    if (!pc) return;

    const type = this.activeFieldType();
    const index = this.activeFieldIndex();

    switch (type) {
      case 'driver':
        this.driverName = pc.label;
        this.driverPostalCode = pc.postalCode;
        break;
      case 'office':
        this.officeName = pc.label;
        this.officePostalCode = pc.postalCode;
        break;
      case 'colleague':
        if (index >= 0 && index < this.colleagues.length) {
          this.colleagues[index].name = pc.label;
          this.colleagues[index].postalCode = pc.postalCode;
        }
        break;
    }
  }

  isAlreadySaved(postalCode: string): boolean {
    return this.savedPostalCodes().some(pc => pc.postalCode === postalCode && pc.country === this.country);
  }

  addColleague(): void {
    this.colleagues = [...this.colleagues, { name: '', postalCode: '' }];
  }

  removeColleague(index: number): void {
    this.colleagues = this.colleagues.filter((_, i) => i !== index);
  }

  openGoogleMaps(): void {
    const url = this.googleMapsUrl();
    if (url) window.open(url, '_blank');
  }

  copyGoogleMapsLink(): void {
    const url = this.googleMapsUrl();
    if (url) {
      this.clipboard.copy(url);
      this.snackBar.open('Link copied to clipboard!', 'Dismiss', { duration: 3000 });
    }
  }

  savePostalCode(label: string, postalCode: string): void {
    if (!label || !postalCode) return;
    this.postalCodeService.save({ label, postalCode, country: this.country }).subscribe({
      next: () => {
        this.snackBar.open(`Saved "${label}" to Postal Codes`, 'Dismiss', { duration: 3000 });
        this.loadSavedPostalCodes();
      },
      error: (err) => {
        this.snackBar.open(`Failed to save: ${err.message || 'Unknown error'}`, 'Dismiss', { duration: 5000 });
      }
    });
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
