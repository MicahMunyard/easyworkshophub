
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '@/types/inventory';
import OrderStatusBadge from './OrderStatusBadge';

interface OrdersListTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

const OrdersListTable: React.FC<OrdersListTableProps> = ({ orders, onViewOrder }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order Date</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              {format(new Date(order.orderDate), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>{order.supplierName}</TableCell>
            <TableCell>{order.items.length} items</TableCell>
            <TableCell className="text-right font-medium">
              ${order.total.toFixed(2)}
            </TableCell>
            <TableCell><OrderStatusBadge status={order.status} /></TableCell>
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onViewOrder(order)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrdersListTable;
