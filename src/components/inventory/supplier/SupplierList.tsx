
import React from 'react';
import { Supplier } from '@/types/inventory';
import SupplierCard from './SupplierCard';
import ApiSupplierCard from './ApiSupplierCard';

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onGetQuote?: (supplier: Supplier) => void;
  onNewOrder: (supplier: Supplier) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  onEdit,
  onDelete,
  onGetQuote,
  onNewOrder
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier) => {
        if (supplier.connectionType === 'api') {
          return (
            <ApiSupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={onEdit}
              onDelete={onDelete}
              onGetQuote={onGetQuote || (() => {})}
              onNewOrder={onNewOrder}
            />
          );
        }
        
        return (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            onEdit={onEdit}
            onDelete={onDelete}
            onNewOrder={onNewOrder}
          />
        );
      })}
    </div>
  );
};

export default SupplierList;
