import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SavedPostalCode, SavedPostalCodeRequest } from '../models/postal-code.model';

@Injectable({ providedIn: 'root' })
export class PostalCodeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/user/saved-postal-codes`;

  list(): Observable<SavedPostalCode[]> {
    return this.http.get<SavedPostalCode[]>(this.baseUrl);
  }

  save(request: SavedPostalCodeRequest): Observable<SavedPostalCode> {
    return this.http.post<SavedPostalCode>(this.baseUrl, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
