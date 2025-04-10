
import { useState } from 'react';
import { InvoiceStatus } from '@/types/invoice';
import { useInvoicesList } from './useInvoicesList';
import { useCompletedJobs } from './useCompletedJobs';
import { useInvoiceMutations } from './useInvoiceMutations';
import { CreateInvoiceParams } from './types';

export const useInvoices = () => {
  const { 
    invoices, 
    isLoading, 
    selectedInvoice, 
    setSelectedInvoice, 
    refetchInvoices 
  } = useInvoicesList();
  
  const { completedJobs } = useCompletedJobs();
  
  const [setInvoicesState] = useState<any>(() => (newInvoices: any) => {});

  const { 
    createInvoice: createInvoiceMutation, 
    updateInvoiceStatus: updateInvoiceStatusMutation 
  } = useInvoiceMutations(refetchInvoices, setInvoicesState, selectedInvoice, setSelectedInvoice);

  // Forward the createInvoice function with the same signature as before
  const createInvoice = (invoice: CreateInvoiceParams) => {
    return createInvoiceMutation(invoice);
  };

  // Forward the updateInvoiceStatus function with the same signature as before
  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    return updateInvoiceStatusMutation(invoiceId, status);
  };

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
