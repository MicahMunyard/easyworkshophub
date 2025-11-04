
// Authentication Types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Product and Inventory Types
export interface ProductInventoryRequest {
  customerAccount: string;
  customerId: string;
  password?: string;
  stores: { code: string }[];
  parts: { 
    qty: number;
    sku: string;
  }[];
}

export interface ProductInventoryResponse {
  inventory: {
    available: number;
    requested: number;
    sku: string;
    storeCode: string;
  }[];
}

// Quote Types
export interface QuoteResponseHeaders {
  encryptedVehicleId: number;
  rego: string;
  make: string;
  model: string;
  dateServed: string;
  customerAddress: string;
  customerSuburb: string;
  customerName: string;
  purchaseOrderNumber: string;
  customerId: string;
  repId: string;
  customerAccount: string;
  locationId: string;
  locationName: string;
  host: string;
  userAgent: string;
  password?: string; // EzyParts account password for order submission
}

export interface PartItem {
  partNumber: string;
  sku: string;
  brand: string;
  partDescription: string;
  retailPriceEa: number;
  nettPriceEach: number;
  qty: number;
  partGroup: string;
  productCategory: string;
  barcode: string;
}

export interface CustomItem {
  code: string;
  description: string;
  qty: number;
  retailPriceEa: number;
  nettPriceEach: number;
  ItemNumber: string;
  ItemName: string;
}

export interface RepairTime {
  operationDescription: string;
  operationId: string;
  operationTime: string;
  operationAction: string;
  sectionId: number;
  subSectionId: number;
  labourPartNumber: string;
  labourCostPrice: number;
  labourRetailPrice: number;
}

export interface ServiceOperation {
  lineType: number;  // 0 = Line item, 1 = Heading
  heading: string;
  operationDescription: string;
  operationType: string;
}

export interface JobSheet {
  conditions: string;
  standardSchedule: string;
  specialSchedule: string;
  serviceOperations: ServiceOperation[];
}

export interface RecommendedPart {
  liquidQty: number;
  category: string;
  grade: string;
  longFootnote: string;
  retailPriceEa: number;
}

export interface QuoteResponse {
  headers: QuoteResponseHeaders;
  parts: PartItem[];
  customItems: CustomItem[];
  repairTimes: RepairTime[];
  jobSheet: JobSheet;
  recommendedParts: RecommendedPart[];
}

// Order Types
export interface OrderSubmissionRequest {
  inputMetaData: {
    checkCurrentPosition: boolean;  // Force order indicator
  };
  headers: {
    customerAccount: string;
    customerId: string;
    Password: string;
    locationId: string;
    locationName: string;
    customerName: string;
    customerAddress: string;
    customerSuburb: string;
    purchaseOrderNumber: string;
    dateServed: string;
    repId?: string;
    encryptedVehicleId?: number;
    rego?: string;
    make?: string;
    model?: string;
    deliveryType: string;  // 1 = Delivery, 2 = Pick-Up
    note?: string;
    host?: string;
    userAgent?: string;
    salesOrderSalesAuditList?: {
      salesAuditFieldNumber: string;
      salesAuditValue: string;
    }[];
  };
  parts: {
    qty: number;
    sku: string;
    nettPriceEach: number;
    retailPriceEa: number;
  }[];
}

export interface OrderSubmissionResponse {
  failOrderLines: {
    qty: number;
    sku: string;
    nettPriceEach: number;
    retailPriceEa: number;
    reason: string;
  }[];
  headers: {
    customerAccount: string;
    customerAddress: string;
    customerId: string;
    customerName: string;
    customerSuburb: string;
    dateServed: string;
    encryptedVehicleId: string | number;
    locationId: string;
    locationName: string;
    make: string;
    model: string;
    password: string;
    purchaseOrderNumber: string;
    rego: string;
    repId: string;
    deliveryType: string;
    salesOrderSalesAuditList: {
      salesAuditFieldNumber: string;
      salesAuditValue: string;
    }[];
  };
  salesOrderNumber: string;
  successOrderLines: {
    qty: number;
    sku: string;
  }[];
}

// Vehicle Search Types
export interface VehicleSearchParams {
  vehicleId?: number;
  regoNumber?: string;
  state?: string;
  make?: string;
  model?: string;
  year?: string | number;
  seriesChassis?: string;
  engine?: string;
  isRegoSearch?: boolean;
}

// Saved Quote Types for History
export interface SavedQuote {
  quote: QuoteResponse;
  timestamp: string;
  vehicle: {
    make: string;
    model: string;
    rego?: string;
  };
}
