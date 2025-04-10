
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { JobType } from "@/types/job";

// Define the actual type returned from the database
export interface JobFromDB {
  assigned_to: string;
  created_at: string;
  customer: string;
  date: string;
  id: string;
  priority: string;
  service: string;
  status: string;
  time: string;
  time_estimate: string;
  updated_at: string;
  user_id: string;
  vehicle: string;
  cost?: number | string | null;
}

export interface CompletedJobWithCustomer extends JobType {
  customerEmail?: string;
  customerPhone?: string;
}

export interface CreateInvoiceParams extends Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateInvoiceStatusParams {
  invoiceId: string;
  status: InvoiceStatus;
}
