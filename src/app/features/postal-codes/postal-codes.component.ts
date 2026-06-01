import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { PostalCodeService } from '../../core/services/postal-code.service';
import { SavedPostalCode } from '../../core/models/postal-code.model';
import { COUNTRIES } from '../../core/constants/countries';

@Component({
  selector: 'app-postal-codes',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatDialogModule, MatSelectModule
  ],
  template: `
    <div class="page-container">
      <h2>Saved Postal Codes</h2>
      <p class="subtitle">Manage your frequently used postal codes for quick route planning</p>

      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Add New Postal Code</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (saveError()) {
            <div class="error-message">{{ saveError() }}</div>
          }

          <div class="add-form">
            <mat-form-field appearance="outline">
              <mat-label>Label</mat-label>
              <input matInput [(ngModel)]="newLabel" placeholder="e.g. Home, Office">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Postal Code</mat-label>
              <input matInput [(ngModel)]="newPostalCode" placeholder="e.g. D02 X285">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <mat-select [(ngModel)]="newCountry">
                @for (c of countries; track c.code) {
                  <mat-option [value]="c.code">{{ c.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="savePostalCode()"
                    [disabled]="saving() || !newLabel || !newPostalCode || !newCountry">
              @if (saving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>add</mat-icon> Save
              }
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loadError()) {
        <div class="error-message">{{ loadError() }}</div>
      }

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (postalCodes().length === 0) {
        <mat-card class="empty-card">
          <mat-card-content>
            <div class="empty-state">
              <mat-icon>location_off</mat-icon>
              <p>No saved postal codes yet. Add one above to get started.</p>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="table-card">
          <table mat-table [dataSource]="postalCodes()" class="full-width">
            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef>Label</th>
              <td mat-cell *matCellDef="let pc">{{ pc.label }}</td>
            </ng-container>

            <ng-container matColumnDef="postalCode">
              <th mat-header-cell *matHeaderCellDef>Postal Code</th>
              <td mat-cell *matCellDef="let pc">{{ pc.postalCode }}</td>
            </ng-container>

            <ng-container matColumnDef="country">
              <th mat-header-cell *matHeaderCellDef>Country</th>
              <td mat-cell *matCellDef="let pc">{{ pc.country }}</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let pc">{{ formatDate(pc.createdAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="lastUsedAt">
              <th mat-header-cell *matHeaderCellDef>Last Used</th>
              <td mat-cell *matCellDef="let pc">{{ formatDate(pc.lastUsedAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let pc">
                <button mat-icon-button color="warn" (click)="deletePostalCode(pc.id)"
                        [disabled]="deleting() === pc.id">
                  @if (deleting() === pc.id) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <mat-icon>delete</mat-icon>
                  }
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; }
    .subtitle { color: #666; margin-bottom: 24px; }
    .form-card { margin-bottom: 24px; }
    .add-form {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
      mat-form-field { flex: 1; min-width: 150px; }
    }
    .error-message {
      background: #fdecea; color: #611a15;
      padding: 12px; border-radius: 4px; margin-bottom: 16px;
    }
    .loading-container {
      display: flex; justify-content: center; padding: 48px;
    }
    .empty-card { margin-top: 16px; }
    .empty-state {
      text-align: center; padding: 48px;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #999; }
      p { color: #666; margin-top: 16px; }
    }
    .table-card { margin-top: 16px; }
    .full-width { width: 100%; }
  `]
})
export class PostalCodesComponent implements OnInit {
  private readonly postalCodeService = inject(PostalCodeService);

  postalCodes = signal<SavedPostalCode[]>([]);
  loading = signal(false);
  saving = signal(false);
  deleting = signal<string | null>(null);
  loadError = signal('');
  saveError = signal('');

  newLabel = '';
  newPostalCode = '';
  countries = COUNTRIES;
  newCountry = 'IE';

  displayedColumns = ['label', 'postalCode', 'country', 'createdAt', 'lastUsedAt', 'actions'];

  ngOnInit(): void {
    this.loadPostalCodes();
  }

  loadPostalCodes(): void {
    this.loading.set(true);
    this.loadError.set('');

    this.postalCodeService.list().subscribe({
      next: (codes) => {
        this.postalCodes.set(codes);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.error?.error || 'Failed to load postal codes.');
        this.loading.set(false);
      }
    });
  }

  savePostalCode(): void {
    this.saving.set(true);
    this.saveError.set('');

    this.postalCodeService.save({
      label: this.newLabel,
      postalCode: this.newPostalCode,
      country: this.newCountry
    }).subscribe({
      next: (saved) => {
        this.postalCodes.set([...this.postalCodes(), saved]);
        this.newLabel = '';
        this.newPostalCode = '';
        this.saving.set(false);
      },
      error: (err) => {
        this.saveError.set(err.error?.error || 'Failed to save postal code.');
        this.saving.set(false);
      }
    });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  deletePostalCode(id: string): void {
    this.deleting.set(id);

    this.postalCodeService.delete(id).subscribe({
      next: () => {
        this.postalCodes.set(this.postalCodes().filter(pc => pc.id !== id));
        this.deleting.set(null);
      },
      error: (err) => {
        this.loadError.set(err.error?.error || 'Failed to delete postal code.');
        this.deleting.set(null);
      }
    });
  }
}
