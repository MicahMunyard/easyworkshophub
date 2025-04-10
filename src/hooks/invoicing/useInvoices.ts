
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus, InvoiceItem } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';
import { JobType } from '@/types/job';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedJobs, setCompletedJobs] = useState<(JobType & { customerEmail?: string, customerPhone?: string })[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch invoices from the database
  const fetchInvoices = async () => {
    setIsLoading(true);
    if (!user) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    try {
      // Using explicit typed query for user_invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('user_invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      if (invoicesData) {
        // Now fetch the invoice items for each invoice with proper typing
        const invoicesWithItems = await Promise.all(
          invoicesData.map(async (invoice) => {
            const { data: invoiceItems, error: itemsError } = await supabase
              .from('user_invoice_items')
              .select('*')
              .eq('invoice_id', invoice.id);

            if (itemsError) throw itemsError;

            // Transform the items to match our InvoiceItem interface
            const transformedItems: InvoiceItem[] = (invoiceItems || []).map(item => ({
              id: item.id,
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unit_price),
              total: Number(item.total),
              taxRate: item.tax_rate ? Number(item.tax_rate) : undefined
            }));

            // Transform to match our Invoice interface
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
              status: invoice.status as InvoiceStatus,
              notes: invoice.notes,
              termsAndConditions: invoice.terms_and_conditions,
              createdAt: invoice.created_at,
              updatedAt: invoice.updated_at
            } as Invoice;
          })
        );

        setInvoices(invoicesWithItems);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedJobs = async () => {
    if (!user) return;
    
    try {
      // This query needs to be modified since the relationship between jobs and user_bookings 
      // is causing errors. Let's retrieve jobs and customer details separately.
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'completed')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        // Transform jobs data
        const transformedJobs = await Promise.all(data.map(async (job) => {
          // For each job, let's separately fetch any related customer info from user_bookings
          let customerEmail = '';
          let customerPhone = '';
          
          // Try to find matching booking with the customer info
          const { data: bookingData } = await supabase
            .from('user_bookings')
            .select('customer_email, customer_phone')
            .eq('customer_name', job.customer)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (bookingData) {
            customerEmail = bookingData.customer_email || '';
            customerPhone = bookingData.customer_phone || '';
          }
          
          // Type-safe handling of the cost field
          let jobCost = 0;
          if (job.cost !== undefined && job.cost !== null) {
            // Handle numeric or string cost
            const parsedCost = typeof job.cost === 'number' ? job.cost : parseFloat(String(job.cost));
            jobCost = isNaN(parsedCost) ? 0 : parsedCost;
          }
          
          return {
            id: job.id,
            customer: job.customer,
            vehicle: job.vehicle,
            service: job.service,
            status: job.status as "pending" | "inProgress" | "working" | "completed" | "cancelled",
            assignedTo: job.assigned_to,
            date: job.date,
            time: job.time || '',
            timeEstimate: job.time_estimate,
            priority: job.priority,
            cost: jobCost,
            customerEmail: customerEmail,
            customerPhone: customerPhone
          };
        }));
        
        setCompletedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
    }
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create invoices',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      // Insert the invoice record with proper type definition
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('user_invoices')
        .insert({
          user_id: user.id,
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

      if (invoiceError) throw invoiceError;

      // Insert all invoice items
      if (invoiceData) {
        const invoiceItems = invoice.items.map(item => ({
          invoice_id: invoiceData.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.taxRate || 0,
          total: item.total
        }));

        // Insert all items at once with proper typing
        const { error: itemsError } = await supabase
          .from('user_invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }
      
      // Fetch updated invoices list
      await fetchInvoices();
      
      toast({
        title: 'Success',
        description: `Invoice ${invoice.invoiceNumber} created successfully`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: InvoiceStatus) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to update invoices',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      // Use typed update with proper parameters
      const { error } = await supabase
        .from('user_invoices')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, status, updatedAt: new Date().toISOString() } 
            : inv
        )
      );
      
      // If we have a selected invoice and it's the one being updated, update that too
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({
          ...selectedInvoice,
          status,
          updatedAt: new Date().toISOString()
        });
      }
      
      toast({
        title: 'Success',
        description: `Invoice status updated to ${status}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
      fetchCompletedJobs();
    }
  }, [user]);

  return {
    invoices,
    isLoading,
    selectedInvoice,
    setSelectedInvoice,
    createInvoice,
    updateInvoiceStatus,
    completedJobs
  };
};
