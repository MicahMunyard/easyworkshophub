
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier } from '@/types/inventory';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import { useToast } from '@/components/ui/use-toast';
import SupplierForm from './SupplierForm';
import SupplierList from './supplier/SupplierList';
import OrderSelectionModal from './OrderSelectionModal';
import ManualOrderForm from './ManualOrderForm';

const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [selectedSupplierForOrder, setSelectedSupplierForOrder] = useState<Supplier | null>(null);

  const handleOpenDialog = (supplier?: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingSupplier(undefined);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (data: Omit<Supplier, 'id'>) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
      } else {
        await addSupplier(data);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (window.confirm(`Are you sure you want to delete supplier: ${supplier.name}?`)) {
      try {
        await deleteSupplier(supplier.id);
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handleStartApiOrder = (supplier: Supplier) => {
    // This is now handled in the SupplierOrderCard component
    // For non-EzyParts API suppliers, we can show a generic message
    if (supplier.name !== 'Burson Auto Parts' && supplier.supplierId !== 'burson-auto-parts') {
      toast({
        title: "API Integration",
        description: `Connecting to ${supplier.name} API for ordering. This integration is not yet configured.`,
      });
    }
    setIsOrderModalOpen(false);
  };

  const handleStartManualOrder = (supplier: Supplier) => {
    setSelectedSupplierForOrder(supplier);
    setIsOrderModalOpen(false);
    setIsManualOrderOpen(true);
  };

  const handleCloseManualOrder = () => {
    setIsManualOrderOpen(false);
    setSelectedSupplierForOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">Manage your parts suppliers and connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOrderModalOpen(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" /> New Order
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Suppliers Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first supplier to start managing inventory orders
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" /> Add First Supplier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <SupplierList 
          suppliers={suppliers}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />
      )}

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? `Edit ${editingSupplier.name}` : 'Add New Supplier'}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm 
            supplier={editingSupplier} 
            onSubmit={handleSubmit} 
            onCancel={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Order Selection Modal */}
      <OrderSelectionModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        suppliers={suppliers}
        onStartApiOrder={handleStartApiOrder}
        onStartManualOrder={handleStartManualOrder}
      />

      {/* Manual Order Form */}
      {selectedSupplierForOrder && (
        <ManualOrderForm
          isOpen={isManualOrderOpen}
          onClose={handleCloseManualOrder}
          supplier={selectedSupplierForOrder}
        />
      )}
    </div>
  );
};

export default SupplierManagement;
