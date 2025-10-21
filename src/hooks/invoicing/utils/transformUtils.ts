
import { Invoice, InvoiceItem } from '@/types/invoice';
import { CompletedJobWithCustomer, JobFromDB } from '../types';

export const transformInvoiceItems = (invoiceItems: any[]): InvoiceItem[] => {
  return (invoiceItems || []).map(item => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    total: Number(item.total),
    taxRate: item.tax_rate ? Number(item.tax_rate) : undefined
  }));
};

export const transformInvoice = (invoice: any, transformedItems: InvoiceItem[]): Invoice => {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    jobId: invoice.job_id,
    customerId: invoice.customer_id,
    customerName: invoice.customer_name,
    customerEmail: invoice.customer_email,
    customerPhone: invoice.customer_phone,
    date: invoice.date,
    dueDate: invoice.due_date,
    items: transformedItems,
    subtotal: Number(invoice.subtotal),
    taxTotal: Number(invoice.tax_total),
    total: Number(invoice.total),
    status: invoice.status,
    notes: invoice.notes,
    termsAndConditions: invoice.terms_and_conditions,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at
  } as Invoice;
};

export const transformJobCost = (job: JobFromDB): number => {
  let jobCost = 0;
  if (job.cost !== undefined && job.cost !== null) {
    // Handle numeric or string cost
    const parsedCost = typeof job.cost === 'number' ? job.cost : parseFloat(String(job.cost));
    jobCost = isNaN(parsedCost) ? 0 : parsedCost;
  }
  return jobCost;
};

export const transformCompletedJob = (
  job: any, 
  customerEmail: string, 
  customerPhone: string
): CompletedJobWithCustomer => {
  return {
    id: job.id,
    customer: job.customer_name || job.customer,
    vehicle: job.car || job.vehicle,
    service: job.service,
    status: job.status as "pending" | "inProgress" | "working" | "completed" | "cancelled",
    assignedTo: job.technician_id || job.assigned_to,
    date: job.booking_date || job.date,
    time: job.booking_time || job.time || '',
    timeEstimate: job.time_estimate,
    priority: job.priority,
    cost: transformJobCost(job),
    customerEmail,
    customerPhone
  };
};
