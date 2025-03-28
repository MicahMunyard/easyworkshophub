
import { useState, useEffect } from 'react';
import { Order, OrderItem } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      
      const savedCurrentOrder = localStorage.getItem('currentOrder');
      if (savedCurrentOrder) {
        setCurrentOrder(JSON.parse(savedCurrentOrder));
      }
      
      setIsLoading(false);
    };

    loadOrders();
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
    localStorage.setItem('currentOrder', JSON.stringify(newOrder));
    
    toast({
      title: "Order Created",
      description: `New order for ${supplierName} has been created.`
    });
    
    return newOrder;
  };

  const addItemToOrder = (item: OrderItem) => {
    if (!currentOrder) return;
    
    // Check if item already exists in order
    const existingItemIndex = currentOrder.items.findIndex(i => i.itemId === item.itemId);
    
    let updatedItems: OrderItem[];
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = currentOrder.items.map((i, index) => 
        index === existingItemIndex 
          ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.price } 
          : i
      );
    } else {
      // Add new item
      updatedItems = [...currentOrder.items, item];
    }
    
    const updatedTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: updatedTotal
    };
    
    setCurrentOrder(updatedOrder);
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
    
    toast({
      title: "Item Added",
      description: `${item.name} has been added to the order.`
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    if (!currentOrder) return;
    
    const updatedItems = currentOrder.items.filter(item => item.itemId !== itemId);
    const updatedTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: updatedTotal
    };
    
    setCurrentOrder(updatedOrder);
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from the order."
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!currentOrder) return;
    
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
    
    const updatedTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: updatedTotal
    };
    
    setCurrentOrder(updatedOrder);
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
  };

  const submitOrder = (notes?: string) => {
    if (!currentOrder) return;
    
    const submittedOrder = {
      ...currentOrder,
      status: 'submitted' as const,
      notes: notes || currentOrder.notes
    };
    
    // Add to orders list
    const updatedOrders = [...orders, submittedOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Clear current order
    setCurrentOrder(null);
    localStorage.removeItem('currentOrder');
    
    toast({
      title: "Order Submitted",
      description: `Order #${submittedOrder.id.slice(0, 8)} has been submitted successfully.`
    });
    
    return submittedOrder;
  };

  const cancelOrder = () => {
    if (!currentOrder) return;
    
    setCurrentOrder(null);
    localStorage.removeItem('currentOrder');
    
    toast({
      title: "Order Cancelled",
      description: "The current order has been cancelled.",
      variant: "destructive"
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
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
