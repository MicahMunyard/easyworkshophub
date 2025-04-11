
export type AustralianState = 'ACT' | 'NSW' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' | 'NT';

export type NevdisProduct = 
  | 'VEHICLE_AGE' 
  | 'EXTENDED_DATA' 
  | 'HIGH_PERFORMANCE_INFO' 
  | 'REGISTRATION' 
  | 'STOLEN_INFO' 
  | 'WRITTEN_OFF_INFO' 
  | 'REGISTRATION_LOCALITY';

// Authentication types
export interface ExchangeTokenRequest {
  grant_type: 'client_credentials';
  client_id: string;
  client_secret: string;
}

export interface AccessTokenResponse {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

// Vehicle Report types
export interface VehicleReportRequest {
  plate?: string;
  state?: AustralianState;
  plateType?: string;
  vin?: string;
  chassis?: string;
  clientReference?: string;
  products: NevdisProduct[];
}

export interface VehicleIdentification {
  plate?: string;
  state?: AustralianState;
  vin?: string;
  chassis?: string;
}

export interface VehicleAge {
  yearOfManufacture?: number;
  compliancePlate?: string;
}

export interface VehicleExtendedData {
  makeCode?: string;
  makeDescription?: string;
  model?: string;
  modelDescription?: string;
  colour?: string;
  bodyType?: string;
  vehicleType?: string;
  engineNumber?: string;
}

export interface HighPerformanceInfo {
  power?: number;
  weight?: number;
  powerToWeight?: number;
}

export interface Registration {
  status?: string;
  expiryDate?: string;
}

export interface StolenIncident {
  incidentType?: string;
  jurisdiction?: AustralianState;
  reportedDate?: string;
  summary?: string;
}

export interface StolenInfo {
  incidents?: StolenIncident[];
}

export interface RegistrationDisposal {
  disposalFlag?: string;
}

export interface RegistrationLocality {
  status?: 'OK' | 'NOT_AVAILABLE' | 'SUPPRESSED';
  postCode?: string;
  suburb?: string;
  suppressionReason?: string;
}

export interface RegistrationStatus {
  status?: string;
}

export interface Vehicle {
  identification: VehicleIdentification;
  vehicleAge?: VehicleAge;
  extendedData?: VehicleExtendedData;
  highPerformanceInfo?: HighPerformanceInfo;
  registration?: Registration;
  stolenInfo?: StolenInfo;
  registrationDisposal?: RegistrationDisposal;
  registrationLocality?: RegistrationLocality;
  registrationStatus?: RegistrationStatus;
}

export interface VehicleReportResponse {
  id: string;
  type: string;
  timestamp: number;
  request: VehicleReportRequest & { timestamp: number; description?: string };
  result: {
    timestamp: number;
    responseCode: 'SUCCESS' | 'NO_MATCH';
    description?: string;
    vehicles?: Vehicle[];
    error?: {
      errorCode: number;
      errorMessage: string;
      errorType: string;
    };
  };
}

export interface SystemStatusResponse {
  timestamp: number;
  service_status: Array<{
    name: string;
    status: string;
  }>;
}
