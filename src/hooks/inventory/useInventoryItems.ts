
import { useState, useEffect } from 'react';
import { InventoryItem, VehicleFitmentTag } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load inventory items from Supabase with vehicle fitment data
  const loadInventoryItems = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // First, get inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (inventoryError) throw inventoryError;

      if (!inventoryData || inventoryData.length === 0) {
        setInventoryItems([]);
        setIsLoading(false);
        return;
      }

      // Get vehicle fitment data for these inventory items
      const inventoryIds = inventoryData.map(item => item.id);
      
      const { data: fitmentData, error: fitmentError } = await supabase
        .from('inventory_vehicle_fitment')
        .select(`
          inventory_item_id,
          vehicle_fitment_tags (
            id,
            make,
            model,
            year_from,
            year_to,
            engine_size,
            fuel_type,
            body_type,
            created_at
          )
        `)
        .in('inventory_item_id', inventoryIds);

      if (fitmentError) {
        console.error('Error loading vehicle fitment data:', fitmentError);
        // Continue without fitment data
      }

      // Create a map of inventory item ID to vehicle fitment tags
      const fitmentMap = new Map<string, VehicleFitmentTag[]>();
      if (fitmentData) {
        fitmentData.forEach(item => {
          if (item.vehicle_fitment_tags) {
            const existingTags = fitmentMap.get(item.inventory_item_id) || [];
            fitmentMap.set(item.inventory_item_id, [...existingTags, item.vehicle_fitment_tags as VehicleFitmentTag]);
          }
        });
      }

      // Transform Supabase data to match our InventoryItem interface
      const transformedItems: InventoryItem[] = inventoryData.map(item => ({
        id: item.id,
        code: item.code || item.id.substring(0, 8).toUpperCase(),
        name: item.name,
        description: item.description || `${item.name} - ${item.category || 'General'}`,
        category: item.category || 'General',
        supplier: item.supplier || 'Unknown',
        supplierId: item.supplier_id || 'unknown',
        inStock: item.in_stock,
        minStock: item.min_stock,
        price: Number(item.price || 0),
        retailPrice: Number(item.retail_price || 0),
        location: item.location || '',
        lastOrder: item.last_order?.toString() || '',
        status: item.status as 'normal' | 'low' | 'critical',
        imageUrl: item.image_url || undefined,
        brand: item.brand || undefined,
        vehicleFitment: fitmentMap.get(item.id) || []
      }));

      setInventoryItems(transformedItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast({
        title: "Error Loading Inventory",
        description: "Failed to load inventory items from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryItems();
  }, [user]);

  // Update item status based on stock levels
  const updateItemStatus = (item: InventoryItem): InventoryItem['status'] => {
    if (item.inStock <= 0) {
      return 'critical';
    } else if (item.inStock <= item.minStock) {
      return 'low';
    } else {
      return 'normal';
    }
  };

  // Add a new inventory item
  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'status'>): Promise<InventoryItem | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add inventory items.",
        variant: "destructive",
      });
      return null;
    }

    const newItem: InventoryItem = {
      ...itemData,
      id: uuidv4(),
      status: updateItemStatus({ ...itemData, id: '', status: 'normal' })
    };

    try {
      const { data, error } = await supabase
        .from('user_inventory_items')
        .insert({
          user_id: user.id,
          code: newItem.code,
          name: newItem.name,
          description: newItem.description,
          category: newItem.category,
          supplier: newItem.supplier,
          supplier_id: newItem.supplierId,
          in_stock: newItem.inStock,
          min_stock: newItem.minStock,
          price: newItem.price,
          location: newItem.location,
          status: newItem.status,
          last_order: newItem.lastOrder ? newItem.lastOrder : null,
          image_url: newItem.imageUrl || null,
          brand: newItem.brand || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setInventoryItems(prev => [newItem, ...prev]);
      
      toast({
        title: "Product Added",
        description: `${newItem.name} has been added to inventory.`,
      });
      
      return newItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error Adding Product",
        description: "Failed to add product to inventory.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing inventory item
  const updateInventoryItem = async (id: string, updatedData: Partial<Omit<InventoryItem, 'id' | 'status'>>) => {
    if (!user) return;

    try {
      const updatedItem = {
        code: updatedData.code,
        name: updatedData.name,
        description: updatedData.description,
        category: updatedData.category,
        supplier: updatedData.supplier,
        supplier_id: updatedData.supplierId,
        in_stock: updatedData.inStock,
        min_stock: updatedData.minStock,
        price: updatedData.price,
        retail_price: updatedData.retailPrice,
        location: updatedData.location,
        last_order: updatedData.lastOrder ? updatedData.lastOrder : null,
        image_url: updatedData.imageUrl || null,
        brand: updatedData.brand || null
      };

      const { error } = await supabase
        .from('user_inventory_items')
        .update(updatedItem)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setInventoryItems(prev => prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updatedData };
          updated.status = updateItemStatus(updated);
          return updated;
        }
        return item;
      }));
      
      toast({
        title: "Product Updated",
        description: "Product information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error Updating Product",
        description: "Failed to update product information.",
        variant: "destructive",
      });
    }
  };

  // Delete an inventory item
  const deleteInventoryItem = async (id: string) => {
    if (!user) return;

    const itemToDelete = inventoryItems.find(item => item.id === id);
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('user_inventory_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setInventoryItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Product Deleted",
        description: `${itemToDelete.name} has been removed from inventory.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error Deleting Product",
        description: "Failed to delete product from inventory.",
        variant: "destructive",
      });
    }
  };

  // Duplicate an inventory item
  const duplicateInventoryItem = async (item: InventoryItem) => {
    const newItem: Omit<InventoryItem, 'id' | 'status'> = {
      ...item,
      name: `${item.name} (Copy)`,
      code: `${item.code}-COPY`,
    };
    
    await addInventoryItem(newItem);
    
    toast({
      title: "Product Duplicated",
      description: `${item.name} has been duplicated successfully.`,
    });
  };

  // Refresh inventory items (useful after EzyParts webhook)
  const refreshInventoryItems = () => {
    loadInventoryItems();
  };

  return {
    inventoryItems,
    isLoading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    duplicateInventoryItem,
    refreshInventoryItems
  };
};
