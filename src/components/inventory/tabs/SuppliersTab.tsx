
import React from 'react';
import { Supplier } from '@/types/inventory';
import SupplierManagement from '../SupplierManagement';

interface SuppliersTabProps {
  isOrderMode: boolean;
  selectedSupplier: Supplier | null;
  onStartOrder: (supplier: Supplier) => void;
  onBack: () => void;
  onOrderComplete: () => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({
  isOrderMode,
  selectedSupplier,
  onStartOrder,
  onBack,
  onOrderComplete
}) => {
  
  if (isOrderMode && selectedSupplier) {
    return (
      <OrderForm 
        supplier={selectedSupplier} 
        onBack={onBack} 
        onComplete={onOrderComplete}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SupplierManagement />
    </div>
  );
};

// We need to import OrderForm after the component declaration to avoid circular dependency
import OrderForm from '@/components/inventory/OrderForm';

export default SuppliersTab;
