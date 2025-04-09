
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Supplier } from '@/types/inventory';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import SupplierCard from '../supplier/SupplierCard';
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
  const { suppliers } = useSuppliers();
  
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
      <Card className="col-span-1 md:col-span-3">
        <CardHeader className="p-4 pb-2">
          <CardTitle>Supplier Management</CardTitle>
          <CardDescription>Manage your suppliers and create orders</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <SupplierCard 
                key={supplier.id} 
                supplier={supplier} 
                onStartOrder={onStartOrder}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <SupplierManagement />
    </div>
  );
};

// We need to import OrderForm after the component declaration to avoid circular dependency
import OrderForm from '@/components/inventory/OrderForm';

export default SuppliersTab;
