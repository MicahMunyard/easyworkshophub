
import { useState, useEffect } from 'react';
import { Order, OrderItem } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { 
  loadOrders, 
  loadCurrentOrder, 
  saveOrders, 
  saveCurrentOrder 
} from '@/utils/inventory/orderStorage';
import { 
  addOrUpdateOrderItem, 
  removeOrderItem, 
  updateItemQuantity as updateOrderItemQuantity 
} from '@/utils/inventory/orderItemUtils';
import {
  updateOrderStatus as updateOrderStatusUtil,
  prepareOrderForSubmission
} from '@/utils/inventory/orderStatusUtils';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeOrders = () => {
      setOrders(loadOrders());
      setCurrentOrder(loadCurrentOrder());
      setIsLoading(false);
    };

    initializeOrders();
  }, []);

  const createOrder = (supplierId: string, supplierName: string) => {
    const newOrder: Order = {
      id: uuidv4(),
      supplierId,
      supplierName,
      orderDate: new Date().toISOString(),
      status: 'draft',
      items: [],
      total: 0
    };
    
    setCurrentOrder(newOrder);
    saveCurrentOrder(newOrder);
    
    toast({
      title: "Order Created",
      description: `New order for ${supplierName} has been created.`
    });
    
    return newOrder;
  };

  const addItemToOrder = (item: OrderItem) => {
    if (!currentOrder) return;
    
    const updatedOrder = addOrUpdateOrderItem(currentOrder, item);
    
    setCurrentOrder(updatedOrder);
    saveCurrentOrder(updatedOrder);
    
    toast({
      title: "Item Added",
      description: `${item.name} has been added to the order.`
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    if (!currentOrder) return;
    
    const updatedOrder = removeOrderItem(currentOrder, itemId);
    
    setCurrentOrder(updatedOrder);
    saveCurrentOrder(updatedOrder);
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from the order."
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!currentOrder) return;
    
    const updatedOrder = updateOrderItemQuantity(currentOrder, itemId, quantity);
    
    setCurrentOrder(updatedOrder);
    saveCurrentOrder(updatedOrder);
  };

  const submitOrder = (notes?: string) => {
    if (!currentOrder) return;
    
    const submittedOrder = prepareOrderForSubmission(currentOrder, notes);
    
    // Add to orders list
    const updatedOrders = [...orders, submittedOrder];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    
    // Clear current order
    setCurrentOrder(null);
    saveCurrentOrder(null);
    
    toast({
      title: "Order Submitted",
      description: `Order #${submittedOrder.id.slice(0, 8)} has been submitted successfully.`
    });
    
    return submittedOrder;
  };

  const cancelOrder = () => {
    if (!currentOrder) return;
    
    setCurrentOrder(null);
    saveCurrentOrder(null);
    
    toast({
      title: "Order Cancelled",
      description: "The current order has been cancelled.",
      variant: "destructive"
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = updateOrderStatusUtil(orders, orderId, status);
    
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    
    toast({
      title: "Order Updated",
      description: `Order status has been updated to ${status}.`
    });
  };

  return {
    orders,
    currentOrder,
    isLoading,
    createOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateItemQuantity,
    submitOrder,
    cancelOrder,
    updateOrderStatus
  };
};
