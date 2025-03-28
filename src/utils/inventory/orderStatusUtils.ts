
import { Order } from '@/types/inventory';

/**
 * Updates the status of an order
 */
export const updateOrderStatus = (orders: Order[], orderId: string, status: Order['status']): Order[] => {
  return orders.map(order => 
    order.id === orderId ? { ...order, status } : order
  );
};

/**
 * Prepares an order for submission
 */
export const prepareOrderForSubmission = (currentOrder: Order, notes?: string): Order => {
  return {
    ...currentOrder,
    status: 'submitted' as const,
    notes: notes || currentOrder.notes
  };
};
