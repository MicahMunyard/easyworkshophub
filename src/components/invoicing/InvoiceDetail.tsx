
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, CreditCard, ArrowLeft } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types/invoice';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onBack, onUpdateStatus }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2">
          {invoice.status === 'pending' && (
            <Button
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
              onClick={() => onUpdateStatus(invoice.id, 'paid')}
            >
              <CreditCard className="h-4 w-4 mr-2" /> Mark as Paid
            </Button>
          )}
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Status: <span className={`font-medium ${
                  invoice.status === 'paid' ? 'text-green-600' : 
                  invoice.status === 'pending' ? 'text-amber-600' :
                  invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm">Invoice Date: <span className="font-medium">{invoice.date}</span></p>
              <p className="text-sm">Due Date: <span className="font-medium">{invoice.dueDate}</span></p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">From</h3>
              <p className="font-medium">Your Workshop Name</p>
              <p className="text-sm">123 Workshop Street</p>
              <p className="text-sm">City, State 12345</p>
              <p className="text-sm">Phone: (123) 456-7890</p>
              <p className="text-sm">Email: info@yourworkshop.com</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Bill To</h3>
              <p className="font-medium">{invoice.customerName}</p>
              {invoice.customerEmail && <p className="text-sm">Email: {invoice.customerEmail}</p>}
              {invoice.customerPhone && <p className="text-sm">Phone: {invoice.customerPhone}</p>}
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="font-medium mb-4">Invoice Items</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.taxRate ? `${item.taxRate}%` : '0%'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600">Tax Total:</span>
                <span className="text-sm font-medium">${invoice.taxTotal.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-1">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {invoice.notes && (
            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}
          
          {invoice.termsAndConditions && (
            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Terms & Conditions</h3>
              <p className="text-sm">{invoice.termsAndConditions}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">Thank you for your business!</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvoiceDetail;
