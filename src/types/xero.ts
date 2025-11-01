export interface XeroAccount {
  accountID: string;
  code: string;
  name: string;
  type: string;
  taxType?: string;
  description?: string;
  class?: string;
  status?: string;
  enablePaymentsToAccount?: boolean;
}

export interface XeroTaxRate {
  name: string;
  taxType: string;
  displayTaxRate?: number;
  effectiveRate?: number;
  status?: string;
}

export interface XeroAccountMapping {
  id?: string;
  userId: string;
  invoiceAccountCode?: string;
  cashPaymentAccountCode?: string;
  bankPaymentAccountCode?: string;
  creditAccountCode?: string;
  billAccountCode?: string;
  billCashPaymentAccountCode?: string;
  billBankPaymentAccountCode?: string;
  supplierCreditAccountCode?: string;
  invoiceTaxCode?: string;
  invoiceTaxFreeCode?: string;
  billTaxCode?: string;
  billTaxFreeCode?: string;
  isConfigured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bill {
  id: string;
  userId: string;
  billNumber: string;
  supplierId?: string;
  supplierName: string;
  billDate: string;
  dueDate?: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  expenseType?: 'stock' | 'marketing' | 'supplies' | 'other';
  notes?: string;
  xeroBillId?: string;
  xeroSyncedAt?: string;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
  items?: BillItem[];
}

export interface BillItem {
  id: string;
  billId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
  inventoryItemId?: string;
  accountCode?: string;
  createdAt: string;
}

export type SyncResourceType = 'invoice' | 'payment' | 'bill' | 'bill_payment' | 'customer' | 'supplier' | 'inventory';
export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncQueueItem {
  id: string;
  userId: string;
  resourceType: SyncResourceType;
  resourceId: string;
  operation: SyncOperation;
  status: SyncStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  lastAttemptAt?: string;
  payload?: any;
  createdAt: string;
  completedAt?: string;
}

export interface SyncHistoryItem {
  id: string;
  userId: string;
  resourceType: SyncResourceType;
  resourceId?: string;
  operation: SyncOperation;
  status: 'success' | 'error';
  xeroId?: string;
  requestPayload?: any;
  responseData?: any;
  errorMessage?: string;
  syncedAt: string;
}
