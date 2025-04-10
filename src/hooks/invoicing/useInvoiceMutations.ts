
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { InvoiceStatus } from '@/types/invoice';
import { CreateInvoiceParams, UpdateInvoiceStatusParams } from './types';
import { insertInvoice, insertInvoiceItems, updateInvoiceStatusInDB } from './api/invoiceApi';

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
          total: item.total
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
