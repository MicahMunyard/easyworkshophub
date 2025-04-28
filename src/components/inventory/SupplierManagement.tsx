
import React, { useState, useEffect } from 'react';
import { Supplier } from '@/types/inventory';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import SupplierHeader from './supplier/SupplierHeader';
import SupplierList from './supplier/SupplierList';
import SupplierDialog from './supplier/SupplierDialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useEzyParts } from '@/contexts/EzyPartsContext';

const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { credentials } = useEzyParts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('manage');
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSupplierOrder = (supplier: Supplier) => {
    if (supplier.connectionType === 'api') {
      if (supplier.apiConfig?.type === 'bursons') {
        // Check if EzyParts credentials exist
        if (!credentials.accountId || !credentials.username || !credentials.password) {
          // Redirect to EzyParts configuration page if credentials are missing
          navigate('/ezyparts/config');
          toast({
            title: "Configuration Required",
            description: "Please configure your EzyParts credentials first",
          });
        } else {
          // Let the ApiSupplierCard handle the connection
          // This supplier card will be clicked in the UI
        }
      }
    } else {
      // Navigate to manual order form
      navigate(`/inventory/orders/new?supplier=${supplier.id}`);
      toast({
        title: "Create Order",
        description: `Starting new order for ${supplier.name}`,
      });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div 
              key={supplier.id} 
              className="cursor-pointer"
              onClick={() => handleSupplierOrder(supplier)}
            >
              <div className="p-4 rounded-lg border border-border hover:border-primary transition-colors">
                <div className="flex items-center gap-4">
                  {supplier.logoUrl && (
                    <img 
                      src={supplier.logoUrl} 
                      alt={supplier.name} 
                      className="w-16 h-12 object-contain"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplier.category}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
