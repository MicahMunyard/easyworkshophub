export type TransactionReferenceType = 'invoice' | 'job' | 'manual_adjustment' | 'purchase' | 'initial_stock';

export interface InventoryTransaction {
  id: string;
  userId: string;
  inventoryItemId: string;
  referenceType: TransactionReferenceType;
  referenceId?: string;
  quantityChange: number;
  quantityAfter: number;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}
