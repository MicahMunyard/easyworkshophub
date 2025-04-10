
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';
import { JobFromDB } from '../types';

export const fetchInvoicesData = async (userId: string) => {
  return await supabase
    .from('user_invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const fetchInvoiceItems = async (invoiceId: string) => {
  return await supabase
    .from('user_invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId);
};

export const fetchCompletedJobsData = async (userId: string) => {
  return await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'completed')
    .eq('user_id', userId);
};

export const fetchCustomerInfoForJob = async (customerName: string, userId: string) => {
  return await supabase
    .from('user_bookings')
    .select('customer_email, customer_phone')
    .eq('customer_name', customerName)
    .eq('user_id', userId)
    .maybeSingle();
};

export const insertInvoice = async (
  userId: string,
  invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
) => {
  return await supabase
    .from('user_invoices')
    .insert({
      user_id: userId,
      invoice_number: invoice.invoiceNumber,
      job_id: invoice.jobId,
      customer_id: invoice.customerId,
      customer_name: invoice.customerName,
      customer_email: invoice.customerEmail,
      customer_phone: invoice.customerPhone,
      date: invoice.date,
      due_date: invoice.dueDate,
      subtotal: invoice.subtotal,
      tax_total: invoice.taxTotal,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      terms_and_conditions: invoice.termsAndConditions
    })
    .select()
    .single();
};

export const insertInvoiceItems = async (invoiceItems: any[]) => {
  return await supabase
    .from('user_invoice_items')
    .insert(invoiceItems);
};

export const updateInvoiceStatusInDB = async (
  invoiceId: string, 
  userId: string, 
  status: InvoiceStatus
) => {
  return await supabase
    .from('user_invoices')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)
    .eq('user_id', userId);
};
