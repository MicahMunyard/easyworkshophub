
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';
import { JobType } from '@/types/job';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedJobs, setCompletedJobs] = useState<JobType[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Fetch invoices from the database
  const fetchInvoices = async () => {
    setIsLoading(true);
    if (!user) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    try {
      // This would be replaced with actual Supabase query once the table is created
      // For now, we'll return mock data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-0001',
          jobId: 'JOB-2024-001',
          customerId: 'CUST001',
          customerName: 'John Smith',
          customerEmail: 'john@example.com',
          customerPhone: '555-123-4567',
          date: '2024-06-15',
          dueDate: '2024-07-15',
          items: [
            { 
              id: 'item1', 
              description: 'Brake System Repair', 
              quantity: 1, 
              unitPrice: 350, 
              total: 350 
            },
            { 
              id: 'item2', 
              description: 'Brake Pads', 
              quantity: 2, 
              unitPrice: 75, 
              total: 150 
            }
          ],
          subtotal: 500,
          taxTotal: 40,
          total: 540,
          status: 'paid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-0002',
          jobId: 'JOB-2024-002',
          customerId: 'CUST002',
          customerName: 'Sarah Williams',
          customerEmail: 'sarah@example.com',
          customerPhone: '555-234-5678',
          date: '2024-06-16',
          dueDate: '2024-07-16',
          items: [
            { 
              id: 'item1', 
              description: 'Oil Change', 
              quantity: 1, 
              unitPrice: 85, 
              total: 85 
            },
            { 
              id: 'item2', 
              description: 'Oil Filter', 
              quantity: 1, 
              unitPrice: 15, 
              total: 15 
            }
          ],
          subtotal: 100,
          taxTotal: 8,
          total: 108,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setInvoices(mockInvoices);

      // Check if user is admin
      // This logic would be replaced by actual role checking
      setIsAdmin(true);

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
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');
        
      if (error) throw error;
      
      if (data) {
        const transformedJobs = data.map(job => ({
          id: job.id,
          customer: job.customer,
          vehicle: job.vehicle,
          service: job.service,
          status: job.status as "pending" | "inProgress" | "working" | "completed" | "cancelled",
          assignedTo: job.assigned_to,
          date: job.date,
          time: job.time || '',
          timeEstimate: job.time_estimate,
          priority: job.priority
        })) as JobType[];
        
        setCompletedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
    }
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only admins can create invoices',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      // This would be replaced with actual Supabase insert
      // For mock purposes, we'll just add it to our state
      const newInvoice: Invoice = {
        ...invoice,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      
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
    if (!user || !isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only admins can update invoices',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      // This would be replaced with actual Supabase update
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, status, updatedAt: new Date().toISOString() } 
            : inv
        )
      );
      
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
    isAdmin,
    selectedInvoice,
    setSelectedInvoice,
    createInvoice,
    updateInvoiceStatus,
    completedJobs
  };
};
