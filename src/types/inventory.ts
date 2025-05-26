
export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  isDefault?: boolean;
  logoUrl?: string;
  connectionType: 'manual' | 'api';
  apiConfig?: ApiSupplierConfig;
}

export interface VehicleFitmentTag {
  id: string;
  make: string;
  model: string;
  year_from?: number;
  year_to?: number;
  engine_size?: string;
  fuel_type?: string;
  body_type?: string;
  created_at: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  supplier: string;
  supplierId: string;
  inStock: number;
  minStock: number;
  price: number;
  location?: string;
  lastOrder?: string;
  status: 'normal' | 'low' | 'critical';
  imageUrl?: string;
  brand?: string;
  vehicleFitment?: VehicleFitmentTag[];
  specifications?: ProductSpecification[];
  partGroup?: string;
  barcode?: string;
  retailPrice?: number;
}

export interface OrderItem {
  itemId: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
  notes?: string;
}

export type SupplierConnectionType = 'manual' | 'api';
export type SupplierApiType = 'bursons' | 'other';

export interface ApiSupplierConfig {
  type: SupplierApiType;
  connectionUrl?: string;
  isConnected: boolean;
}
