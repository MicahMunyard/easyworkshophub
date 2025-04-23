
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Check, Clock, Printer, Save } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import SyncInvoiceButton from "./SyncInvoiceButton";
import { useAccountingIntegrations } from "@/hooks/invoicing/useAccountingIntegrations";

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const statusVariants: Record<InvoiceStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  paid: { 
    bg: "bg-green-100", 
    text: "text-green-800", 
    icon: <Check className="h-4 w-4" /> 
  },
  pending: { 
    bg: "bg-orange-100", 
    text: "text-orange-800",
    icon: <Clock className="h-4 w-4" /> 
  },
  overdue: { 
    bg: "bg-red-100", 
    text: "text-red-800",
    icon: <Clock className="h-4 w-4" /> 
  },
  draft: { 
    bg: "bg-gray-100", 
    text: "text-gray-800",
    icon: <Save className="h-4 w-4" /> 
  },
  cancelled: { 
    bg: "bg-gray-100", 
    text: "text-gray-800",
    icon: null 
  },
};

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onBack, onUpdateStatus }) => {
  const { hasActiveIntegration } = useAccountingIntegrations();
  const showXeroSync = hasActiveIntegration('xero');
  
  const handleMarkAsPaid = () => {
    onUpdateStatus(invoice.id, 'paid');
  };
  
  const handleMarkAsOverdue = () => {
    onUpdateStatus(invoice.id, 'overdue');
  };
  
  const statusVariant = statusVariants[invoice.status];
  
  const formattedDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2">
          {showXeroSync && (
            <SyncInvoiceButton invoice={invoice} />
          )}
          <Button variant="outline" className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {invoice.status === 'pending' && (
            <Button onClick={handleMarkAsPaid}>Mark as Paid</Button>
          )}
          {invoice.status === 'pending' && (
            <Button 
              variant="outline" 
              onClick={handleMarkAsOverdue}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Mark as Overdue
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl">Invoice #{invoice.invoiceNumber}</CardTitle>
            <CardDescription>
              Created on {formattedDate(invoice.createdAt)}
            </CardDescription>
          </div>
          <Badge 
            className={`${statusVariant.bg} ${statusVariant.text} flex items-center gap-1 px-3 py-1`}
          >
            {statusVariant.icon}
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-1">Bill To:</h3>
              <div className="text-sm">
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Invoice Date:</h3>
                <p className="text-sm">{formattedDate(invoice.date)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Due Date:</h3>
                <p className="text-sm">{formattedDate(invoice.dueDate)}</p>
              </div>
              
              {invoice.xeroInvoiceId && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Xero Invoice:</h3>
                  <p className="text-sm flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-600 mr-1.5"></span>
                    Synced
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                  <TableCell className="text-right">${invoice.subtotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Tax</TableCell>
                  <TableCell className="text-right">${invoice.taxTotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                  <TableCell className="text-right font-medium">${invoice.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {(invoice.notes || invoice.termsAndConditions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoice.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Notes:</h3>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
              
              {invoice.termsAndConditions && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Terms and Conditions:</h3>
                  <p className="text-sm text-muted-foreground">{invoice.termsAndConditions}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetail;
