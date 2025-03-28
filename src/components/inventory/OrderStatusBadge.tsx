
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/inventory';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'submitted':
      return <Badge variant="secondary">Submitted</Badge>;
    case 'processing':
      return <Badge>Processing</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default OrderStatusBadge;
