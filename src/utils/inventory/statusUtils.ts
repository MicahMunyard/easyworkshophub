
import { InventoryItem } from '@/types/inventory';

export const calculateItemStatus = (
  inStock: number, 
  minStock: number
): InventoryItem['status'] => {
  if (inStock <= 0) return 'critical';
  if (inStock < minStock) return 'low';
  return 'normal';
};

export const recalculateItemStatus = (item: InventoryItem): InventoryItem['status'] => {
  return calculateItemStatus(item.inStock, item.minStock);
};
