
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier } from '@/types/inventory';
import SupplierOrderCard from './SupplierOrderCard';

interface OrderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  onStartApiOrder: (supplier: Supplier) => void;
  onStartManualOrder: (supplier: Supplier) => void;
}

const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onStartApiOrder,
  onStartManualOrder
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Supplier for New Order</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {suppliers.map((supplier) => (
            <SupplierOrderCard
              key={supplier.id}
              supplier={supplier}
              onStartApiOrder={onStartApiOrder}
              onStartManualOrder={onStartManualOrder}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSelectionModal;
