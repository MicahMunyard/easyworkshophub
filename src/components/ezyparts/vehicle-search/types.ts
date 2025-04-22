
export interface DetailsSearch {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
  seriesChassis: string;
  engine: string;
}

export interface RegistrationSearch {
  regoNumber: string;
  state: string;
  isRegoSearch: boolean;
}
