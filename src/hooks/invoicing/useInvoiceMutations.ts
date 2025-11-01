
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { InvoiceStatus } from '@/types/invoice';
import { CreateInvoiceParams, UpdateInvoiceStatusParams } from './types';
import { insertInvoice, insertInvoiceItems, updateInvoiceStatusInDB } from './api/invoiceApi';
import { supabase } from '@/integrations/supabase/client';

export const useInvoiceMutations = (
  onSuccess?: () => void,
  setInvoices?: React.Dispatch<React.SetStateAction<any[]>>,
  selectedInvoice?: any,
  setSelectedInvoice?: React.Dispatch<React.SetStateAction<any>>
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const createInvoice = async (invoice: CreateInvoiceParams) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create invoices',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      const { data: invoiceData, error: invoiceError } = await insertInvoice(user.id, invoice);

      if (invoiceError) throw invoiceError;

      if (invoiceData) {
        const invoiceItems = invoice.items.map(item => ({
          invoice_id: invoiceData.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.taxRate || 0,
          total: Number((item.quantity * item.unitPrice).toFixed(2))
        }));

        const { error: itemsError } = await insertInvoiceItems(invoiceItems);

        if (itemsError) throw itemsError;
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
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
      // First, fetch the invoice to check if it's synced to Xero
      const { data: invoiceData, error: fetchError } = await supabase
        .from('user_invoices')
        .select('id, total, xero_invoice_id')
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await updateInvoiceStatusInDB(invoiceId, user.id, status);

      if (error) throw error;
      
      // Update local state if setInvoices is provided
      if (setInvoices) {
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === invoiceId 
              ? { ...inv, status, updatedAt: new Date().toISOString() } 
              : inv
          )
        );
      }
      
      // If we have a selected invoice and it's the one being updated, update that too
      if (setSelectedInvoice && selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({
          ...selectedInvoice,
          status,
          updatedAt: new Date().toISOString()
        });
      }

      // If marking as paid AND invoice is synced to Xero, sync the payment
      if (status === 'paid' && invoiceData?.xero_invoice_id) {
        try {
          const { data: accountingData, error: accountingError } = await supabase
            .from('accounting_integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'xero')
            .eq('status', 'active')
            .single();

          if (!accountingError && accountingData) {
            const { data: accountMappingData } = await supabase
              .from('xero_account_mappings')
              .select('cash_payment_account_code')
              .eq('user_id', user.id)
              .single();

            const paymentAccountCode = accountMappingData?.cash_payment_account_code || '090';

            await supabase.functions.invoke('xero-integration/sync-invoice-payment', {
              body: {
                invoiceId: invoiceData.id,
                paymentAmount: invoiceData.total,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentAccountCode
              }
            });
          }
        } catch (syncError) {
          console.warn('Failed to sync payment to Xero:', syncError);
          // Don't fail the whole operation, payment sync is non-critical
        }
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

  return {
    createInvoice,
    updateInvoiceStatus
  };
};
