
import { type AUSTRALIAN_STATES } from './constants';

export type AustralianState = typeof AUSTRALIAN_STATES[number]['value'];

export interface RegistrationSearch {
  regoNumber: string;
  state: string;
  isRegoSearch: boolean;
}

export interface DetailsSearch {
  vehicleId?: number;
  make: string;
  model: string;
  year: string;
  seriesChassis: string;
  engine: string;
}

export interface VehicleSearchParams {
  vehicleId?: number;
  regoNumber?: string;
  state?: string;
  make?: string;
  model?: string;
  year?: string;
  seriesChassis?: string;
  engine?: string;
  isRegoSearch?: boolean;
  quoteUrl?: string;
  returnUrl?: string;
}
