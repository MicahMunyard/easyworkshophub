
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

  return {
    fetchLowStockItems
  };
};
