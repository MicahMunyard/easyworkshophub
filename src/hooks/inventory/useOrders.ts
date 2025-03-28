
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
      const savedOrders = localStorage.getItem('inventoryOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      setIsLoading(false);
    };

    loadOrders();
  }, []);

  // Create a new order
  const createOrder = (supplierId: string, supplierName: string) => {
    const newOrder: Order = {
      id: uuidv4(),
      supplierId,
      supplierName,
      orderDate: new Date().toISOString(),
      status: 'draft',
      items: [],
      total: 0,
      notes: ''
    };
    
    setCurrentOrder(newOrder);
    return newOrder;
  };

  // Add an item to the current order
  const addItemToOrder = (item: OrderItem) => {
    if (!currentOrder) return;
    
    // Check if the item already exists in the order
    const existingItemIndex = currentOrder.items.findIndex(i => i.itemId === item.itemId);
    
    let updatedItems;
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedItems = [...currentOrder.items];
      const existingItem = updatedItems[existingItemIndex];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
        total: (existingItem.quantity + 1) * existingItem.price
      };
    } else {
      // Add new item
      updatedItems = [...currentOrder.items, item];
    }
    
    // Calculate new total
    const newTotal = updatedItems.reduce((total, item) => total + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    };
    
    setCurrentOrder(updatedOrder);
    
    toast({
      title: "Item Added",
      description: `${item.name} has been added to your order.`,
    });
    
    return updatedOrder;
  };

  // Remove an item from the current order
  const removeItemFromOrder = (itemId: string) => {
    if (!currentOrder) return;
    
    const updatedItems = currentOrder.items.filter(item => item.itemId !== itemId);
    const newTotal = updatedItems.reduce((total, item) => total + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    };
    
    setCurrentOrder(updatedOrder);
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from your order.",
    });
    
    return updatedOrder;
  };

  // Update item quantity in the current order
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
    
    const newTotal = updatedItems.reduce((total, item) => total + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    };
    
    setCurrentOrder(updatedOrder);
    return updatedOrder;
  };

  // Submit the current order
  const submitOrder = (notes?: string) => {
    if (!currentOrder) return null;
    
    const submittedOrder: Order = {
      ...currentOrder,
      status: 'submitted',
      notes: notes || '',
      orderDate: new Date().toISOString()
    };
    
    const updatedOrders = [...orders, submittedOrder];
    setOrders(updatedOrders);
    setCurrentOrder(null);
    
    // Save to localStorage
    localStorage.setItem('inventoryOrders', JSON.stringify(updatedOrders));
    
    return submittedOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('inventoryOrders', JSON.stringify(updatedOrders));
    
    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}.`,
    });
    
    return updatedOrders.find(order => order.id === orderId) || null;
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
    updateOrderStatus
  };
};
