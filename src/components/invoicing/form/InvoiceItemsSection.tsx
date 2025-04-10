
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import InvoiceItemRow from './InvoiceItemRow';

interface InvoiceItemsSectionProps {
  form: UseFormReturn<any>;
  watchItems: any[];
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItemTotal: (index: number) => void;
}

const InvoiceItemsSection: React.FC<InvoiceItemsSectionProps> = ({
  form,
  watchItems,
  addItem,
  removeItem,
  updateItemTotal
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Invoice Items</h3>
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {watchItems.map((item, index) => (
          <InvoiceItemRow
            key={item.id}
            index={index}
            form={form}
            updateItemTotal={updateItemTotal}
            removeItem={removeItem}
            isRemoveDisabled={watchItems.length <= 1}
          />
        ))}
      </div>

      <div className="flex flex-col items-end space-y-2 pt-4 border-t">
        <div className="flex justify-between w-60">
          <span className="text-sm">Subtotal:</span>
          <span className="font-medium">${form.watch('subtotal').toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-60">
          <span className="text-sm">Tax:</span>
          <span className="font-medium">${form.watch('taxTotal').toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-60 text-lg font-bold">
          <span>Total:</span>
          <span>${form.watch('total').toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemsSection;
