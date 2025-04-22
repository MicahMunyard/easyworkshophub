
import React from 'react';
import { Supplier } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ApiSupplierCard from './ApiSupplierCard';

interface SupplierListProps {
  suppliers: Supplier[];
  filteredSuppliers: Supplier[];
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string, name: string) => void;
  onAddSupplier: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  filteredSuppliers,
  onEditSupplier,
  onDeleteSupplier,
  onAddSupplier,
}) => {
  // Filter the suppliers directly from the filtered suppliers prop
  const apiSuppliers = filteredSuppliers.filter(s => s.connectionType === 'api');
  const manualSuppliers = filteredSuppliers.filter(s => s.connectionType === 'manual');

  return (
    <div className="space-y-6">
      {/* API Connected Suppliers */}
      <div>
        <h2 className="text-lg font-semibold mb-4">API Connected Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiSuppliers.length > 0 ? (
            apiSuppliers.map((supplier) => (
              <ApiSupplierCard key={supplier.id} supplier={supplier} />
            ))
          ) : (
            <p className="text-muted-foreground">No API connected suppliers found.</p>
          )}
        </div>
      </div>

      {/* Add Supplier Button */}
      <div className="flex justify-end">
        <Button onClick={onAddSupplier}>
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </Button>
      </div>

      {/* Manual Suppliers */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Manual Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {manualSuppliers.length > 0 ? (
            manualSuppliers.map((supplier) => (
              <div key={supplier.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEditSupplier(supplier)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDeleteSupplier(supplier.id, supplier.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No manual suppliers found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
