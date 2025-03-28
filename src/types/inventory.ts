
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
