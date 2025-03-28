
import { InventoryItem } from '@/types/inventory';

const INVENTORY_STORAGE_KEY = 'inventoryItems';

export const loadInventoryItems = (): InventoryItem[] => {
  try {
    const savedItems = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  } catch (error) {
    console.error('Error loading inventory items:', error);
    return [];
  }
};

export const saveInventoryItems = (items: InventoryItem[]): void => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving inventory items:', error);
  }
};
