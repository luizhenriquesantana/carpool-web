import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RouteRequest, RouteResponse, WeeklyRouteRequest, WeeklyRouteResponse } from '../models/route.model';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private readonly http = inject(HttpClient);

  planRoute(request: RouteRequest): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(`${environment.apiUrl}/api/route`, request);
  }

  planWeeklyRoute(request: WeeklyRouteRequest): Observable<WeeklyRouteResponse> {
    return this.http.post<WeeklyRouteResponse>(`${environment.apiUrl}/api/weekly-route`, request);
  }
}
