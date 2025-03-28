
import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { loadInventoryItems, saveInventoryItems } from '@/utils/inventory/storage';
import { calculateItemStatus, recalculateItemStatus } from '@/utils/inventory/statusUtils';

export const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load inventory items from localStorage on initialization
  useEffect(() => {
    const items = loadInventoryItems();
    setInventoryItems(items);
    setIsLoading(false);
  }, []);

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'status'>) => {
    const status = calculateItemStatus(item.inStock, item.minStock);
    
    const newItem: InventoryItem = {
      ...item,
      id: uuidv4(),
      status
    };
    
    const updatedItems = [...inventoryItems, newItem];
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory.`,
    });
    
    return newItem;
  };

  const updateInventoryItem = (id: string, updatedData: Partial<InventoryItem>) => {
    const updatedItems = inventoryItems.map(item => {
      if (item.id === id) {
        const updatedItem: InventoryItem = { ...item, ...updatedData };
        
        // Recalculate status if stock levels changed
        if ('inStock' in updatedData || 'minStock' in updatedData) {
          updatedItem.status = recalculateItemStatus(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    toast({
      title: "Item Updated",
      description: "Inventory item has been updated successfully.",
    });
  };

  const deleteInventoryItem = (id: string) => {
    const itemToDelete = inventoryItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const updatedItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    toast({
      title: "Item Deleted",
      description: `${itemToDelete.name} has been removed from inventory.`,
      variant: "destructive",
    });
  };

  const updateStockLevel = (id: string, change: number) => {
    const updatedItems = inventoryItems.map(item => {
      if (item.id === id) {
        const newStockLevel = Math.max(0, item.inStock + change);
        const newStatus: InventoryItem['status'] = calculateItemStatus(newStockLevel, item.minStock);
        
        return {
          ...item,
          inStock: newStockLevel,
          status: newStatus,
          lastOrder: change > 0 ? new Date().toISOString().split('T')[0] : item.lastOrder
        };
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    toast({
      title: "Stock Updated",
      description: "Inventory stock level has been adjusted.",
    });
  };

  return {
    inventoryItems,
    isLoading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStockLevel
  };
};
