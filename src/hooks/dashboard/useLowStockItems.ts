import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LowStockItem {
  id: string;
  name: string;
  in_stock: number;
  min_stock: number;
}

export const useLowStockItems = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['low-stock-items', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_inventory_items')
        .select('id, name, in_stock, min_stock')
        .eq('user_id', userId);

      if (error) throw error;

      // Manual filter to get items below minimum stock
      return (data || []).filter(item => 
        (item.in_stock || 0) < (item.min_stock || 0)
      );
    },
    enabled: !!userId,
    refetchInterval: 60000,
  });
};
