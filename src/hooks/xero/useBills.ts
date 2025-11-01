import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bill, BillItem } from '@/types/xero';

export const useBills = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user]);

  const fetchBills = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: billsData, error: billsError } = await supabase
        .from('user_bills')
        .select('*')
        .eq('user_id', user.id)
        .order('bill_date', { ascending: false });

      if (billsError) throw billsError;

      if (billsData) {
        const billsWithItems = await Promise.all(
          billsData.map(async (bill) => {
            const { data: items, error: itemsError } = await supabase
              .from('user_bill_items')
              .select('*')
              .eq('bill_id', bill.id);

            if (itemsError) throw itemsError;

            return {
              id: bill.id,
              userId: bill.user_id,
              billNumber: bill.bill_number,
              supplierId: bill.supplier_id,
              supplierName: bill.supplier_name,
              billDate: bill.bill_date,
              dueDate: bill.due_date,
              subtotal: parseFloat(String(bill.subtotal)),
              taxTotal: parseFloat(String(bill.tax_total)),
              total: parseFloat(String(bill.total)),
              status: bill.status as Bill['status'],
              expenseType: bill.expense_type as Bill['expenseType'],
              notes: bill.notes,
              xeroBillId: bill.xero_bill_id,
              xeroSyncedAt: bill.xero_synced_at,
              lastSyncError: bill.last_sync_error,
              createdAt: bill.created_at,
              updatedAt: bill.updated_at,
              items: items?.map((item) => ({
                id: item.id,
                billId: item.bill_id,
                description: item.description,
                quantity: parseFloat(String(item.quantity)),
                unitPrice: parseFloat(String(item.unit_price)),
                taxRate: parseFloat(String(item.tax_rate || '0')),
                total: parseFloat(String(item.total)),
                inventoryItemId: item.inventory_item_id,
                accountCode: item.account_code,
                createdAt: item.created_at,
              })),
            } as Bill;
          })
        );

        setBills(billsWithItems);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBill = async (billData: Partial<Bill>, items: Partial<BillItem>[]) => {
    if (!user) return false;

    try {
      const { data: billResult, error: billError } = await supabase
        .from('user_bills')
        .insert({
          user_id: user.id,
          bill_number: billData.billNumber,
          supplier_id: billData.supplierId,
          supplier_name: billData.supplierName,
          bill_date: billData.billDate,
          due_date: billData.dueDate,
          subtotal: billData.subtotal,
          tax_total: billData.taxTotal,
          total: billData.total,
          status: billData.status || 'draft',
          expense_type: billData.expenseType,
          notes: billData.notes,
        })
        .select()
        .single();

      if (billError) throw billError;

      const itemsToInsert = items.map((item) => ({
        bill_id: billResult.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        total: item.total,
        inventory_item_id: item.inventoryItemId,
        account_code: item.accountCode,
      }));

      const { error: itemsError } = await supabase
        .from('user_bill_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      await fetchBills();

      toast({
        title: 'Success',
        description: 'Bill created successfully',
      });

      return true;
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bill',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateBillStatus = async (billId: string, status: Bill['status']) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_bills')
        .update({ status })
        .eq('id', billId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBills();

      toast({
        title: 'Success',
        description: 'Bill status updated',
      });

      return true;
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bill status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const syncBillToXero = async (bill: Bill) => {
    if (!user) return false;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'xero-integration/sync-bill',
        {
          body: { bill }
        }
      );

      if (error) throw error;

      if (data?.success) {
        await fetchBills();
        toast({
          title: 'Success',
          description: `Bill #${bill.billNumber} synced to Xero`,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing bill to Xero:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync bill to Xero',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncBillPayment = async (billId: string, paymentAmount: number, paymentDate: string) => {
    if (!user) return false;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'xero-integration/sync-bill-payment',
        {
          body: { billId, paymentAmount, paymentDate }
        }
      );

      if (error) throw error;

      if (data?.success) {
        await updateBillStatus(billId, 'paid');
        toast({
          title: 'Success',
          description: 'Payment synced to Xero',
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing bill payment:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync payment to Xero',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    bills,
    isLoading,
    isSyncing,
    fetchBills,
    createBill,
    updateBillStatus,
    syncBillToXero,
    syncBillPayment,
  };
};
