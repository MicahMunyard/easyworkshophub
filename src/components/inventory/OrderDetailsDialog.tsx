
import React from 'react';
import { format } from 'date-fns';
import { Order } from '@/types/inventory';
import OrderStatusBadge from './OrderStatusBadge';
import OrderItemsTable from './OrderItemsTable';

interface OrderDetailsDialogProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ order, onStatusChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
          <p className="mt-1">{order.supplierName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
          <p className="mt-1">
            {format(new Date(order.orderDate), 'MMMM d, yyyy')}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <div className="mt-1 flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <select 
              className="text-sm border rounded p-1"
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
            >
              <option value="submitted">Submitted</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      <OrderItemsTable items={order.items} total={order.total} />
      
      {order.notes && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
          <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
            {order.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsDialog;
