import { Component, input, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environment';
import { ApiStop } from '../../../core/models/route.model';

declare const google: any;

declare global {
  interface Window {
    google?: any;
    initGoogleMap?: () => void;
  }
}

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="map-card">
      <mat-card-header>
        <mat-card-title>Route Map</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div #mapContainer class="map-container"></div>
        @if (errorMessage()) {
          <p class="map-error">{{ errorMessage() }}</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .map-card { margin-top: 24px; }
    .map-container {
      width: 100%;
      height: 400px;
      border-radius: 4px;
    }
    .map-error { color: #b3261e; margin: 12px 0 0; }
  `]
})
export class RouteMapComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private mapElement?: HTMLElement;
  private map?: any;
  private markers: any[] = [];
  private routePolylines: any[] = [];

  stops = input<ApiStop[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      const s = this.stops();
      if (s && s.length > 0 && isPlatformBrowser(this.platformId)) {
        this.loadMapAndRender(s);
      }
    });
  }

  private async loadMapAndRender(stops: ApiStop[]): Promise<void> {
    if (!this.mapElement) {
      this.mapElement = document.querySelector('.map-container') as HTMLElement;
      if (!this.mapElement) return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      if (!window.google?.maps) {
        await this.loadGoogleMapsScript();
      }
      await this.renderMap(stops);
    } catch (error) {
      console.error('Unable to render route map:', error);
      this.errorMessage.set('Unable to load the route map. Check the Google Maps API configuration.');
    } finally {
      this.loading.set(false);
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!environment.googleMapsApiKey || environment.googleMapsApiKey.startsWith('YOUR_')) {
        reject(new Error('A valid Google Maps API key has not been configured.'));
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        const check = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&loading=async&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;

      window.initGoogleMap = () => {
        resolve();
      };

      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }

  private async renderMap(stops: ApiStop[]): Promise<void> {
    if (!window.google?.maps || !this.mapElement) return;

    // Clear previous markers and directions
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
    this.routePolylines.forEach(polyline => polyline.setMap(null));
    this.routePolylines = [];

    // Initialize map
    const center = { lat: stops[0].latitude, lng: stops[0].longitude };

    if (!this.map) {
      this.map = new google.maps.Map(this.mapElement, {
        center,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false
      });
    } else {
      this.map.setCenter(center);
    }

    // If only 1 or 2 stops, just show markers (no route needed)
    if (stops.length < 3) {
      this.addMarkers(stops);
      const bounds = new google.maps.LatLngBounds();
      stops.forEach(s => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      this.map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      return;
    }

    const origin = { lat: stops[0].latitude, lng: stops[0].longitude };
    const destination = { lat: stops[stops.length - 1].latitude, lng: stops[stops.length - 1].longitude };
    const intermediates = stops.slice(1, -1).map(stop => ({
      location: { lat: stop.latitude, lng: stop.longitude },
      vehicleStopover: true
    }));

    try {
      const { Route } = await google.maps.importLibrary('routes');
      const { routes } = await Route.computeRoutes({
        origin,
        destination,
        intermediates,
        optimizeWaypointOrder: false,
        travelMode: 'DRIVING',
        fields: ['path']
      });

      if (!routes?.length) {
        throw new Error('No routes found.');
      }

      this.routePolylines = routes[0].createPolylines({
        polylineOptions: {
          strokeColor: '#1976d2',
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });
      this.routePolylines.forEach(polyline => polyline.setMap(this.map));
    } catch (error) {
      console.warn('Routes request failed; displaying a straight-line fallback.', error);
      this.drawStraightLine(stops);
    }

    this.addMarkers(stops);
  }

  private addMarkers(stops: ApiStop[]): void {
    const bounds = new google.maps.LatLngBounds();

    stops.forEach((stop, index) => {
      const position = { lat: stop.latitude, lng: stop.longitude };
      bounds.extend(position);

      const isStart = index === 0;
      const isEnd = index === stops.length - 1;

      const marker = new google.maps.Marker({
        position,
        map: this.map,
        title: `${index + 1}. ${stop.name}`,
        label: {
          text: String(index + 1),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isStart || isEnd ? 14 : 11,
          fillColor: isStart ? '#1976d2' : isEnd ? '#388e3c' : '#7b1fa2',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family:Roboto,sans-serif;font-size:14px;">
          <strong>${index + 1}. ${stop.name}</strong><br/>
          <span style="color:#666;">${stop.postalCode}</span>
        </div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
    });

    this.map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }

  private drawStraightLine(stops: ApiStop[]): void {
    const path = stops.map(s => ({ lat: s.latitude, lng: s.longitude }));
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1976d2',
      strokeOpacity: 0.8,
      strokeWeight: 4
    });
    polyline.setMap(this.map);
    this.routePolylines.push(polyline);
  }
}
