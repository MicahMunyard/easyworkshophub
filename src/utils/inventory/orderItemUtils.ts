
import { Order, OrderItem } from '@/types/inventory';

/**
 * Calculates the total cost of all items in an order
 */
export const calculateOrderTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

/**
 * Adds or updates an item in the order
 */
export const addOrUpdateOrderItem = (currentOrder: Order, newItem: OrderItem): Order => {
  // Check if item already exists in order
  const existingItemIndex = currentOrder.items.findIndex(i => i.itemId === newItem.itemId);
  
  let updatedItems: OrderItem[];
  if (existingItemIndex >= 0) {
    // Update existing item
    updatedItems = currentOrder.items.map((i, index) => 
      index === existingItemIndex 
        ? { 
            ...i, 
            quantity: i.quantity + newItem.quantity, 
            total: (i.quantity + newItem.quantity) * i.price 
          } 
        : i
    );
  } else {
    // Add new item
    updatedItems = [...currentOrder.items, newItem];
  }
  
  const updatedTotal = calculateOrderTotal(updatedItems);
  
  return {
    ...currentOrder,
    items: updatedItems,
    total: updatedTotal
  };
};

/**
 * Removes an item from the order
 */
export const removeOrderItem = (currentOrder: Order, itemId: string): Order => {
  const updatedItems = currentOrder.items.filter(item => item.itemId !== itemId);
  const updatedTotal = calculateOrderTotal(updatedItems);
  
  return {
    ...currentOrder,
    items: updatedItems,
    total: updatedTotal
  };
};

/**
 * Updates an item's quantity in the order
 */
export const updateItemQuantity = (currentOrder: Order, itemId: string, quantity: number): Order => {
  if (quantity < 1) return currentOrder;
  
  const updatedItems = currentOrder.items.map(item => {
    if (item.itemId === itemId) {
      return {
        ...item,
        quantity,
        total: quantity * item.price
      };
    }
    return item;
  });
  
  const updatedTotal = calculateOrderTotal(updatedItems);
  
  return {
    ...currentOrder,
    items: updatedItems,
    total: updatedTotal
  };
};
