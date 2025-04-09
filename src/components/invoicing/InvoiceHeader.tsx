
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InvoiceHeaderProps {
  onCreateInvoice: () => void;
  isAdmin: boolean;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ onCreateInvoice, isAdmin }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Manage invoices for completed jobs
        </p>
      </div>
      
      {isAdmin && (
        <Button 
          onClick={onCreateInvoice}
          className="bg-workshop-red hover:bg-workshop-red/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      )}
    </div>
  );
};

export default InvoiceHeader;
