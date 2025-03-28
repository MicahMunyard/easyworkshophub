
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrders } from '@/hooks/inventory/useOrders';
import { Order } from '@/types/inventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import OrdersListTable from './OrdersListTable';
import EmptyOrdersList from './EmptyOrdersList';
import OrderDetailsDialog from './OrderDetailsDialog';

const OrderHistory: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order History</h2>
          <p className="text-muted-foreground">View and manage your supplier orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {orders.length === 0 ? (
              <EmptyOrdersList />
            ) : (
              <OrdersListTable 
                orders={orders} 
                onViewOrder={handleViewOrder} 
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {viewingOrder && (
            <OrderDetailsDialog 
              order={viewingOrder} 
              onStatusChange={handleStatusChange} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
