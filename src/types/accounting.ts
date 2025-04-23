
export type AccountingProvider = "xero" | "myob";

export interface AccountingIntegration {
  id?: string;
  userId: string;
  provider: AccountingProvider;
  status: "active" | "disconnected" | "error";
  connectedAt: string;
  expiresAt?: string;
  lastSyncAt?: string;
  error?: string;
}

export interface XeroInvoiceData {
  invoiceID: string;
  invoiceNumber: string;
  type: "ACCREC" | "ACCPAY";
  status: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "PAID" | "VOIDED";
  contact: {
    contactID: string;
    name: string;
  };
  date: string;
  dueDate: string;
  lineItems: {
    description: string;
    quantity: number;
    unitAmount: number;
    taxType?: string;
    accountCode?: string;
  }[];
  total: number;
  amountDue: number;
  amountPaid: number;
}

export interface SyncInvoiceResult {
  success: boolean;
  externalId?: string;
  error?: string;
}
