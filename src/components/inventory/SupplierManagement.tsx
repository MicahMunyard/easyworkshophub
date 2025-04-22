
import React, { useState } from 'react';
import { Supplier } from '@/types/inventory';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import SupplierHeader from './supplier/SupplierHeader';
import SupplierList from './supplier/SupplierList';
import SupplierDialog from './supplier/SupplierDialog';

const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (supplier?: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingSupplier(undefined);
    setIsDialogOpen(false);
  };

  const handleSubmit = (data: Omit<Supplier, 'id'>) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, data);
    } else {
      addSupplier(data);
    }
    handleCloseDialog();
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete supplier: ${name}?`)) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="space-y-4">
      <SupplierHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddSupplier={() => handleOpenDialog()}
      />

      <SupplierList 
        suppliers={suppliers}
        filteredSuppliers={filteredSuppliers}
        onEditSupplier={handleOpenDialog}
        onDeleteSupplier={handleDeleteSupplier}
        onAddSupplier={() => handleOpenDialog()}
      />

      <SupplierDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplier={editingSupplier}
        onSubmit={handleSubmit}
        onCancel={handleCloseDialog}
      />
    </div>
  );
};

export default SupplierManagement;
