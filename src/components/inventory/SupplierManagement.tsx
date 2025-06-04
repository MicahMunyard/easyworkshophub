import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier } from '@/types/inventory';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import SupplierList from './supplier/SupplierList';
import ManualOrderForm from './ManualOrderForm';
import EzyPartsOrderModal from './EzyPartsOrderModal';
import VehicleSearch from '../ezyparts/vehicle-search/VehicleSearch';

const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isEzyPartsOrderOpen, setIsEzyPartsOrderOpen] = useState(false);
  const [isEzyPartsSearchOpen, setIsEzyPartsSearchOpen] = useState(false);
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

  const handleGetQuote = (supplier: Supplier) => {
    if (supplier.name === 'Burson Auto Parts') {
      // Open the EzyParts search/auth flow directly
      setIsEzyPartsSearchOpen(true);
    } else {
      toast({
        title: "Quote System",
        description: `Quote functionality for ${supplier.name} is not yet configured.`,
      });
    }
  };

  const handleNewOrder = (supplier: Supplier) => {
    if (supplier.connectionType === 'api') {
      if (supplier.name === 'Burson Auto Parts') {
        // Open EzyParts order modal
        setSelectedSupplierForOrder(supplier);
        setIsEzyPartsOrderOpen(true);
      } else {
        toast({
          title: "API Integration",
          description: `Order integration for ${supplier.name} is not yet configured.`,
        });
      }
    } else {
      // Open manual order form for manual suppliers
      setSelectedSupplierForOrder(supplier);
      setIsManualOrderOpen(true);
    }
  };

  const handleCloseManualOrder = () => {
    setIsManualOrderOpen(false);
    setSelectedSupplierForOrder(null);
  };

  const handleCloseEzyPartsOrder = () => {
    setIsEzyPartsOrderOpen(false);
    setSelectedSupplierForOrder(null);
  };

  const handleCloseEzyPartsSearch = () => {
    setIsEzyPartsSearchOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">Manage your parts suppliers and connections</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </Button>
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
          onGetQuote={handleGetQuote}
          onNewOrder={handleNewOrder}
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

      {/* Manual Order Form */}
      {selectedSupplierForOrder && selectedSupplierForOrder.connectionType === 'manual' && (
        <ManualOrderForm
          isOpen={isManualOrderOpen}
          onClose={handleCloseManualOrder}
          supplier={selectedSupplierForOrder}
        />
      )}

      {/* EzyParts Order Modal */}
      {selectedSupplierForOrder && selectedSupplierForOrder.connectionType === 'api' && (
        <EzyPartsOrderModal 
          isOpen={isEzyPartsOrderOpen}
          onClose={handleCloseEzyPartsOrder}
        />
      )}

      {/* EzyParts Search/Quote Modal */}
      <Dialog open={isEzyPartsSearchOpen} onOpenChange={setIsEzyPartsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>EzyParts - Get Quote</DialogTitle>
          </DialogHeader>
          <VehicleSearch />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
