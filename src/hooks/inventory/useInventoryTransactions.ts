import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { InventoryTransaction, TransactionReferenceType } from "@/types/inventoryTransaction";

export const useInventoryTransactions = () => {
  const { toast } = useToast();

  const deductInventoryStock = async (
    itemId: string,
    quantityUsed: number,
    referenceId: string,
    referenceType: TransactionReferenceType,
    userId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      // Fetch current inventory item
      const { data: item, error: fetchError } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;
      if (!item) throw new Error('Inventory item not found');

      // Convert consumption units to inventory units if bulk product
      let inventoryUnitsToDeduct = quantityUsed;
      if (item.is_bulk_product && item.bulk_quantity) {
        inventoryUnitsToDeduct = quantityUsed / item.bulk_quantity;
      }

      // Calculate new stock level
      const newStockLevel = (item.in_stock || 0) - inventoryUnitsToDeduct;

      // Update inventory stock
      const { error: updateError } = await supabase
        .from('user_inventory_items')
        .update({ 
          in_stock: newStockLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Create transaction log
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          user_id: userId,
          inventory_item_id: itemId,
          reference_type: referenceType,
          reference_id: referenceId,
          quantity_change: -inventoryUnitsToDeduct,
          quantity_after: newStockLevel,
          notes: notes || `Deducted ${quantityUsed}${item.unit_of_measure || 'unit'} from ${item.name}`,
          created_by: userId
        });

      if (transactionError) throw transactionError;

      return true;
    } catch (error) {
      console.error('Error deducting inventory stock:', error);
      toast({
        title: "Inventory Update Error",
        description: error instanceof Error ? error.message : "Failed to update inventory",
        variant: "destructive"
      });
      return false;
    }
  };

  const addInventoryStock = async (
    itemId: string,
    quantityAdded: number,
    referenceId: string,
    referenceType: TransactionReferenceType,
    userId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      // Fetch current inventory item
      const { data: item, error: fetchError } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;
      if (!item) throw new Error('Inventory item not found');

      // Calculate new stock level
      const newStockLevel = (item.in_stock || 0) + quantityAdded;

      // Update inventory stock
      const { error: updateError } = await supabase
        .from('user_inventory_items')
        .update({ 
          in_stock: newStockLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Create transaction log
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          user_id: userId,
          inventory_item_id: itemId,
          reference_type: referenceType,
          reference_id: referenceId,
          quantity_change: quantityAdded,
          quantity_after: newStockLevel,
          notes: notes || `Added ${quantityAdded} units to ${item.name}`,
          created_by: userId
        });

      if (transactionError) throw transactionError;

      return true;
    } catch (error) {
      console.error('Error adding inventory stock:', error);
      toast({
        title: "Inventory Update Error",
        description: error instanceof Error ? error.message : "Failed to update inventory",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTransactionHistory = async (itemId: string, userId: string): Promise<InventoryTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('inventory_item_id', itemId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        inventoryItemId: tx.inventory_item_id,
        referenceType: tx.reference_type as TransactionReferenceType,
        referenceId: tx.reference_id || undefined,
        quantityChange: tx.quantity_change,
        quantityAfter: tx.quantity_after,
        notes: tx.notes || undefined,
        createdAt: tx.created_at,
        createdBy: tx.created_by || undefined
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  };

  return {
    deductInventoryStock,
    addInventoryStock,
    getTransactionHistory
  };
};
