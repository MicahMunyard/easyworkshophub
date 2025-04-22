
import { type AUSTRALIAN_STATES } from './constants';

export type AustralianState = typeof AUSTRALIAN_STATES[number]['value'];

export interface RegistrationSearch {
  regoNumber: string;
  state: string;
  isRegoSearch: boolean;
}

export interface DetailsSearch {
  vehicleId: string;
  make: string;
  model: string;
  year: string;
  seriesChassis: string;
  engine: string;
}

