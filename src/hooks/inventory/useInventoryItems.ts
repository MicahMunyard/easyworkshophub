
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
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: uuidv4(),
      status: updateItemStatus({ ...itemData, id: '', status: 'normal' })
    };
    
    const updatedItems = [...inventoryItems, newItem];
    setInventoryItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Product Added",
      description: `${newItem.name} has been added to inventory.`,
    });
    
    return newItem;
  };

  // Update an existing inventory item
  const updateInventoryItem = (id: string, updatedData: Partial<Omit<InventoryItem, 'id' | 'status'>>) => {
    const updatedItems = inventoryItems.map(item => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          ...updatedData
        };
        updatedItem.status = updateItemStatus(updatedItem);
        return updatedItem;
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Product Updated",
      description: "Product information has been updated successfully.",
    });
  };

  // Delete an inventory item
  const deleteInventoryItem = (id: string) => {
    const itemToDelete = inventoryItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const updatedItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Product Deleted",
      description: `${itemToDelete.name} has been removed from inventory.`,
      variant: "destructive",
    });
  };

  // Duplicate an inventory item
  const duplicateInventoryItem = (item: InventoryItem) => {
    // Create a new code by adding -COPY to the original code
    const newCode = `${item.code}-COPY`;
    
    // Create a new item with a new ID and modified name to indicate it's a copy
    const newItem: Omit<InventoryItem, 'id' | 'status'> = {
      ...item,
      name: `${item.name} (Copy)`,
      code: newCode,
    };
    
    // Add the new item to inventory
    addInventoryItem(newItem);
    
    toast({
      title: "Product Duplicated",
      description: `${item.name} has been duplicated successfully.`,
    });
  };

  return {
    inventoryItems,
    isLoading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    duplicateInventoryItem
  };
};
