
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier } from '@/types/inventory';
import SupplierForm from './SupplierForm';

interface SupplierDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
  onSubmit: (data: Omit<Supplier, 'id'>) => void;
  onCancel: () => void;
}

const SupplierDialog: React.FC<SupplierDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  supplier, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? `Edit ${supplier.name}` : 'Add New Supplier'}
          </DialogTitle>
        </DialogHeader>
        <SupplierForm 
          supplier={supplier} 
          onSubmit={onSubmit} 
          onCancel={onCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default SupplierDialog;
