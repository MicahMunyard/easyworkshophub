
import { type AUSTRALIAN_STATES } from './constants';

export type AustralianState = typeof AUSTRALIAN_STATES[number]['value'];

export interface RegistrationSearch {
  regoNumber: string;
  state: string;
  isRegoSearch: boolean;
}

export interface DetailsSearch {
  vehicleId?: string | number;  // Updated to allow both string and number
  make: string;
  model: string;
  year: string;
  seriesChassis: string;
  engine: string;
}

export interface VehicleSearchParams {
  vehicleId?: string | number;  // Updated to allow both string and number
  regoNumber?: string;
  state?: string;
  make?: string;
  model?: string;
  year?: string | number;
  seriesChassis?: string;
  engine?: string;
  isRegoSearch?: boolean;
  quoteUrl?: string;
  returnUrl?: string;
}

