
import { supabase } from "@/integrations/supabase/client";
import { CreateInvoiceParams } from '../types';
import { InvoiceStatus } from '@/types/invoice';

export const fetchFinishedJobsData = async (userId: string) => {
  return await supabase
    .from('user_bookings')
    .select('*')
    .eq('status', 'completed')
    .eq('user_id', userId)
    .order('booking_date', { ascending: false });
};

export const fetchCustomerInfoForJob = async (customerName: string, userId: string) => {
  return await supabase
    .from('user_bookings')
    .select(`
      customer_email,
      customer_phone
    `)
    .eq('customer_name', customerName)
    .eq('user_id', userId)
    .limit(1)
    .single();
};

// Add the missing methods needed by useInvoiceMutations and useInvoicesList
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

export const insertInvoice = async (userId: string, invoice: CreateInvoiceParams) => {
  return await supabase
    .from('user_invoices')
    .insert({
      user_id: userId,
      invoice_number: invoice.invoiceNumber,
      customer_name: invoice.customerName,
      customer_id: invoice.customerId,
      customer_email: invoice.customerEmail,
      customer_phone: invoice.customerPhone,
      job_id: invoice.jobId,
      date: invoice.date,
      due_date: invoice.dueDate,
      notes: invoice.notes,
      terms_and_conditions: invoice.termsAndConditions,
      subtotal: invoice.subtotal,
      tax_total: invoice.taxTotal,
      total: invoice.total,
      status: invoice.status
    })
    .select('id')
    .single();
};

export const insertInvoiceItems = async (items: any[]) => {
  return await supabase
    .from('user_invoice_items')
    .insert(items);
};

export const updateInvoiceStatusInDB = async (invoiceId: string, userId: string, status: InvoiceStatus) => {
  return await supabase
    .from('user_invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)
    .eq('user_id', userId);
};
