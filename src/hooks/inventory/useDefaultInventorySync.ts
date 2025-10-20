import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useDefaultInventorySync = (userId: string | undefined) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const syncDefaultInventory = async () => {
      if (!userId || syncing || synced) return;

      // Check if already synced using localStorage
      const syncKey = `inventory_synced_${userId}`;
      const alreadySynced = localStorage.getItem(syncKey);
      
      if (alreadySynced === 'true') {
        setSynced(true);
        return;
      }

      setSyncing(true);

      try {
        // 1. Fetch all default products from default_inventory_items table
        const { data: defaultItems, error: fetchError } = await supabase
          .from('default_inventory_items')
          .select('*');

        if (fetchError) throw fetchError;

        if (!defaultItems || defaultItems.length === 0) {
          console.log('No default inventory items to sync');
          localStorage.setItem(syncKey, 'true');
          setSynced(true);
          setSyncing(false);
          return;
        }

        // 2. For each default item, check if it already exists for this user
        for (const item of defaultItems) {
          // Check if product already exists (prevent duplicates)
          const { data: existingItem } = await supabase
            .from('user_inventory_items')
            .select('id')
            .eq('user_id', userId)
            .eq('code', item.code)
            .maybeSingle();

          // Only insert if doesn't exist
          if (!existingItem) {
            const { error: insertError } = await supabase
              .from('user_inventory_items')
              .insert({
                user_id: userId,
                code: item.code,
                name: item.name,
                description: item.description,
                category: item.category,
                supplier: item.supplier,
                supplier_id: item.supplierid,
                in_stock: 0,  // Set to 0 so mechanics know they can order
                min_stock: item.minstock,
                price: item.price,
                location: item.location || 'Main Warehouse',
                image_url: item.imageurl,
                brand: null,
                status: 'critical' // Will show as low stock since 0 < min_stock
              });

            if (insertError) {
              console.error('Error inserting default item:', item.name, insertError);
            }
          }
        }

        // 3. Mark as synced
        localStorage.setItem(syncKey, 'true');
        setSynced(true);

        console.log(`✅ Synced ${defaultItems.length} default products to user inventory`);

      } catch (error) {
        console.error('Error syncing default inventory:', error);
        toast({
          title: "Inventory Sync Error",
          description: "Failed to load default products. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setSyncing(false);
      }
    };

    syncDefaultInventory();
  }, [userId, syncing, synced, toast]);

  return { syncing, synced };
};
