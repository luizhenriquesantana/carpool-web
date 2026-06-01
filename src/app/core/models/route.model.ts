export interface ColleagueRequest {
  name: string;
  postalCode: string;
  street?: string;
  houseNumber?: string;
}

export interface RouteRequest {
  country: string;
  driverName: string;
  driverPostalCode: string;
  driverStreet?: string;
  driverHouseNumber?: string;
  officeName: string;
  officePostalCode: string;
  officeStreet?: string;
  officeHouseNumber?: string;
  tripType: string;
  colleagues: ColleagueRequest[];
}

export interface MemberRequest {
  name: string;
  postalCode: string;
  canDrive: boolean;
  street?: string;
  houseNumber?: string;
}

export interface DayRequest {
  day: string;
  fixedDriverName?: string;
  tripType?: string;
}

export interface WeeklyRouteRequest {
  country: string;
  officeName: string;
  officePostalCode: string;
  officeStreet?: string;
  officeHouseNumber?: string;
  members: MemberRequest[];
  days?: DayRequest[];
}

export interface ApiStop {
  id: string;
  name: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  tripType: string;
  driver: ApiStop;
  office: ApiStop;
  pickupOrder: ApiStop[];
  dropoffOrder: ApiStop[];
  totalEstimatedKm: number;
  totalEstimatedDurationMinutes: number;
  cacheStats: Record<string, number>;
}

export interface DailyRoutePlan {
  day: string;
  tripType: string;
  driver: ApiStop;
  pickupOrder: ApiStop[];
  dropoffOrder: ApiStop[];
  totalEstimatedKm: number;
  totalEstimatedDurationMinutes: number;
}

export interface WeeklyRouteResponse {
  office: ApiStop;
  days: DailyRoutePlan[];
  driverAssignments: Record<string, number>;
  cacheStats: Record<string, number>;
}
