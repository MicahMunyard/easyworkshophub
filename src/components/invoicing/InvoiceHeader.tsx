
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';

interface InvoiceHeaderProps {
  onCreateInvoice: () => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ onCreateInvoice }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoicing</h1>
        <p className="text-muted-foreground">
          Create and manage invoices for completed jobs
        </p>
      </div>
      <div className="flex space-x-2">
        <Button onClick={onCreateInvoice}>
          <FilePlus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
};

export default InvoiceHeader;
