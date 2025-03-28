
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { OrderItem } from '@/types/inventory';

interface OrderItemsTableProps {
  items: OrderItem[];
  total: number;
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items, total }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.itemId}>
              <TableCell className="font-mono text-sm">{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
              <TableCell className="text-right font-medium">
                ${item.total.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold">
              Total:
            </TableCell>
            <TableCell className="text-right font-bold">
              ${total.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderItemsTable;
