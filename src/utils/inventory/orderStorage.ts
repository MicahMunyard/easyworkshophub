
import { Order, OrderItem } from '@/types/inventory';

/**
 * Loads orders from localStorage
 */
export const loadOrders = (): Order[] => {
  const savedOrders = localStorage.getItem('orders');
  if (savedOrders) {
    return JSON.parse(savedOrders);
  }
  return [];
};

/**
 * Loads current draft order from localStorage
 */
export const loadCurrentOrder = (): Order | null => {
  const savedCurrentOrder = localStorage.getItem('currentOrder');
  if (savedCurrentOrder) {
    return JSON.parse(savedCurrentOrder);
  }
  return null;
};

/**
 * Saves orders to localStorage
 */
export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

/**
 * Saves current draft order to localStorage
 */
export const saveCurrentOrder = (order: Order | null): void => {
  if (order) {
    localStorage.setItem('currentOrder', JSON.stringify(order));
  } else {
    localStorage.removeItem('currentOrder');
  }
};
