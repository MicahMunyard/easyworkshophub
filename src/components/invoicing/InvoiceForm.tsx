
import React from 'react';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { JobType } from '@/types/job';
import { useInvoiceForm } from './form/useInvoiceForm';
import InvoiceCustomerSection from './form/InvoiceCustomerSection';
import InvoiceDateSection from './form/InvoiceDateSection';
import InvoiceItemsSection from './form/InvoiceItemsSection';
import InvoiceNotesSection from './form/InvoiceNotesSection';

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
  completedJobs: JobType[];
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, completedJobs, onCancel }) => {
  const {
    form,
    watchItems,
    updateItemTotal,
    addItem,
    removeItem,
    handleJobChange,
    formatInvoiceForSubmission
  } = useInvoiceForm(completedJobs);

  const handleSubmit = form.handleSubmit((data) => {
    const formattedInvoice = formatInvoiceForSubmission(data);
    onSubmit(formattedInvoice);
  });

  return (
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
  );
};

export default InvoiceForm;
