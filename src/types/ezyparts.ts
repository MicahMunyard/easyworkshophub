
// Authentication Types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Product and Inventory Types
export interface ProductInventoryRequest {
  storeId: string;
  products: Array<{
    productCode: string;
    quantity: number;
  }>;
}

export interface ProductInventoryResponse {
  storeId: string;
  products: Array<{
    productCode: string;
    quantity: number;
    available: number;
    price: number;
    description: string;
  }>;
}

// Order Types
export interface OrderSubmissionRequest {
  orderId: string;
  storeId: string;
  items: Array<{
    productCode: string;
    quantity: number;
  }>;
  deliveryInstructions?: string;
}

export interface OrderSubmissionResponse {
  orderId: string;
  status: 'SUCCESS' | 'FAILED';
  message?: string;
  orderReference?: string;
}

// Quote Types
export interface QuoteResponse {
  quoteId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: string;
    engine?: string;
  };
  items: Array<{
    productCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
}
