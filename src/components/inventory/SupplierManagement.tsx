
import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('manage');

  // Reset defaultSuppliers in localStorage to ensure correct data
  useEffect(() => {
    localStorage.removeItem('defaultSuppliers');
  }, []);

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
        onTabChange={setActiveTab}
      />

      {activeTab === 'manage' ? (
        <SupplierList 
          suppliers={suppliers}
          filteredSuppliers={filteredSuppliers}
          onEditSupplier={handleOpenDialog}
          onDeleteSupplier={handleDeleteSupplier}
          onAddSupplier={() => handleOpenDialog()}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          Order creation interface will be implemented here
        </div>
      )}

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
