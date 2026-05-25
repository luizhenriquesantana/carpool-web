export interface SavedPostalCode {
  id: string;
  label: string;
  postalCode: string;
  country: string;
  createdAt?: string;
  lastUsedAt?: string;
}

export interface SavedPostalCodeRequest {
  label: string;
  postalCode: string;
  country: string;
}
