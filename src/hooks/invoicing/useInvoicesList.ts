
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';
import { fetchInvoicesData, fetchInvoiceItems } from './api/invoiceApi';
import { transformInvoice, transformInvoiceItems } from './utils/transformUtils';

export const useInvoicesList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvoices = async () => {
    setIsLoading(true);
    if (!user) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: invoicesData, error: invoicesError } = await fetchInvoicesData(user.id);

      if (invoicesError) throw invoicesError;

      if (invoicesData) {
        const invoicesWithItems = await Promise.all(
          invoicesData.map(async (invoice) => {
            const { data: invoiceItems, error: itemsError } = await fetchInvoiceItems(invoice.id);

            if (itemsError) throw itemsError;

            const transformedItems = transformInvoiceItems(invoiceItems);
            return transformInvoice(invoice, transformedItems);
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

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  return {
    invoices,
    isLoading,
    selectedInvoice,
    setSelectedInvoice,
    refetchInvoices: fetchInvoices
  };
};
