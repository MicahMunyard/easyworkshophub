
import React from 'react';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { JobType } from '@/types/job';
import { useInvoiceForm } from './form/useInvoiceForm';
import InvoiceCustomerSection from './form/InvoiceCustomerSection';
import InvoiceDateSection from './form/InvoiceDateSection';
import InvoiceItemsSection from './form/InvoiceItemsSection';
import InvoiceNotesSection from './form/InvoiceNotesSection';
import InvoiceConfirmationDialog from './InvoiceConfirmationDialog';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
  completedJobs: JobType[];
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, completedJobs, onCancel }) => {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [pendingInvoiceData, setPendingInvoiceData] = React.useState<any>(null);
  const [inventoryImpacts, setInventoryImpacts] = React.useState<any[]>([]);
  
  const {
    form,
    watchItems,
    updateItemTotal,
    addItem,
    removeItem,
    handleJobChange,
    formatInvoiceForSubmission
  } = useInvoiceForm(completedJobs);

  const calculateInventoryImpacts = async (items: any[]) => {
    const impacts = [];
    
    for (const item of items) {
      if (item.inventoryItemId) {
        // Fetch inventory item details
        const { data: inventoryItem } = await supabase
          .from('user_inventory_items')
          .select('*')
          .eq('id', item.inventoryItemId)
          .single();

        if (inventoryItem) {
          const quantityUsed = item.inventoryQuantityUsed || item.quantity;
          const afterStock = inventoryItem.in_stock - (inventoryItem.is_bulk_product 
            ? quantityUsed / (inventoryItem.bulk_quantity || 1)
            : quantityUsed);

          impacts.push({
            itemId: inventoryItem.id,
            itemName: inventoryItem.name,
            currentStock: inventoryItem.in_stock,
            quantityUsed,
            afterStock,
            minStock: inventoryItem.min_stock,
            isBulkProduct: inventoryItem.is_bulk_product,
            bulkQuantity: inventoryItem.bulk_quantity,
            unitOfMeasure: inventoryItem.unit_of_measure,
            pricePerUnit: inventoryItem.price
          });
        }
      }
    }
    
    return impacts;
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const formattedInvoice = formatInvoiceForSubmission(data);
    
    // Calculate inventory impacts
    const impacts = await calculateInventoryImpacts(data.items);
    
    if (impacts.length > 0) {
      // Show confirmation dialog
      setPendingInvoiceData(formattedInvoice);
      setInventoryImpacts(impacts);
      setShowConfirmation(true);
    } else {
      // No inventory items, submit directly
      onSubmit(formattedInvoice);
    }
  });

  const handleConfirmInvoice = () => {
    setShowConfirmation(false);
    if (pendingInvoiceData) {
      onSubmit(pendingInvoiceData);
      setPendingInvoiceData(null);
      setInventoryImpacts([]);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InvoiceCustomerSection 
                form={form} 
                completedJobs={completedJobs} 
                handleJobChange={handleJobChange} 
              />
            </div>

            <div className="space-y-4">
              <InvoiceDateSection form={form} />
            </div>
          </div>

          <InvoiceItemsSection 
            form={form}
            watchItems={watchItems}
            addItem={addItem}
            removeItem={removeItem}
            updateItemTotal={updateItemTotal}
          />

          <InvoiceNotesSection form={form} />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Form>

      <InvoiceConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmInvoice}
        customerName={pendingInvoiceData?.customerName || 'Unknown'}
        invoiceDate={pendingInvoiceData?.invoiceDate || new Date().toISOString().split('T')[0]}
        totalAmount={pendingInvoiceData?.total || 0}
        inventoryImpacts={inventoryImpacts}
      />
    </>
  );
};

export default InvoiceForm;
