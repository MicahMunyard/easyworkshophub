
import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

export const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadInventoryItems = () => {
      const savedItems = localStorage.getItem('inventoryItems');
      if (savedItems) {
        setInventoryItems(JSON.parse(savedItems));
      }
      setIsLoading(false);
    };

    loadInventoryItems();
  }, []);

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'status'>) => {
    const status = item.inStock <= 0 ? 'critical' : 
                  item.inStock < item.minStock ? 'low' : 'normal';
    
    const newItem: InventoryItem = {
      ...item,
      id: uuidv4(),
      status
    };
    
    const updatedItems = [...inventoryItems, newItem];
    setInventoryItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
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
          updatedItem.status = updatedItem.inStock <= 0 ? 'critical' : 
                              updatedItem.inStock < updatedItem.minStock ? 'low' : 'normal';
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
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
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
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
        const newStatus: InventoryItem['status'] = newStockLevel <= 0 ? 'critical' : 
                          newStockLevel < item.minStock ? 'low' : 'normal';
        
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
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
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

