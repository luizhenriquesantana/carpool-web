export interface SavedPostalCode {
  id: string;
  label: string;
  postalCode: string;
  country: string;
}

export interface SavedPostalCodeRequest {
  label: string;
  postalCode: string;
  country: string;
}
