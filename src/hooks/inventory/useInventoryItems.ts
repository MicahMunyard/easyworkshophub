
import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load inventory items from Supabase
  const loadInventoryItems = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to match our InventoryItem interface
      const transformedItems: InventoryItem[] = (data || []).map(item => ({
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
        location: item.location || '',
        lastOrder: item.last_order?.toString() || '',
        status: item.status as 'normal' | 'low' | 'critical',
        imageUrl: undefined
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
          last_order: newItem.lastOrder ? newItem.lastOrder : null
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
        location: updatedData.location,
        last_order: updatedData.lastOrder ? updatedData.lastOrder : null
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
