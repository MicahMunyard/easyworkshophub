
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { FileText, Eye, CreditCard, Printer, Download } from 'lucide-react';

interface InvoicesListProps {
  invoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
}

const InvoiceStatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
    case 'paid':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Paid</Badge>;
    case 'overdue':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Overdue</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-slate-100 text-slate-800">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const InvoicesList: React.FC<InvoicesListProps> = ({ 
  invoices, 
  isLoading, 
  onViewInvoice, 
  onMarkAsPaid 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-muted-foreground">
          When you create invoices, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
            <TableCell>{invoice.customerName}</TableCell>
            <TableCell>{invoice.date}</TableCell>
            <TableCell>{invoice.dueDate}</TableCell>
            <TableCell>${invoice.total.toFixed(2)}</TableCell>
            <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
            <TableCell className="text-right space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewInvoice(invoice)}
              >
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
              {invoice.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                  onClick={() => onMarkAsPaid(invoice.id)}
                >
                  <CreditCard className="h-4 w-4 mr-1" /> Mark Paid
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
              >
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InvoicesList;
