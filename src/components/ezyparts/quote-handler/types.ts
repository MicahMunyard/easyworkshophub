
import { PartItem, QuoteResponse } from '@/types/ezyparts';

export interface CartItem extends PartItem {
  isSelected: boolean;
  qtyChanged?: boolean;
  inventoryChecked?: boolean;
  isAvailable?: boolean;
  availableQty?: number;
}

export interface OrderResponseState {
  salesOrderNumber?: string;
  successItems: { sku: string; qty: number }[];
  failedItems: { sku: string; qty: number; reason: string }[];
}

export interface OrderFormValues {
  purchaseOrder: string;
  orderNotes: string;
  deliveryType: '1' | '2';
  forceOrder: boolean;
}

