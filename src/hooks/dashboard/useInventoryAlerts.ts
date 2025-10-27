
import { supabase } from "@/integrations/supabase/client";

export const useInventoryAlerts = () => {
  const fetchLowStockItems = async (userId: string): Promise<number> => {
    try {
      // Get low stock inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', userId)
        .filter('in_stock', 'lt', 'min_stock');
        
      if (inventoryError) throw inventoryError;
      
      return inventoryData?.length || 0;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return 0;
    }
  };

  const fetchQuotedItems = async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', userId)
        .eq('order_status', 'quoted');
        
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching quoted items:', error);
      return 0;
    }
  };

  const fetchOnOrderItems = async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', userId)
        .eq('order_status', 'on_order');
        
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching on order items:', error);
      return 0;
    }
  };

  return {
    fetchLowStockItems,
    fetchQuotedItems,
    fetchOnOrderItems,
  };
};
