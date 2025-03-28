
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Mail, 
  ArrowLeft,
  Package,
  FileText
} from 'lucide-react';
import { InventoryItem, OrderItem, Supplier } from '@/types/inventory';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import ProductCatalog from './ProductCatalog';
import { useOrders } from '@/hooks/inventory/useOrders';
import { useToast } from '@/components/ui/use-toast';
import { getEdgeFunctionUrl } from '@/hooks/email/utils/supabaseUtils';

type OrderFormProps = {
  supplier: Supplier;
  onBack: () => void;
  onComplete: () => void;
};

const OrderForm: React.FC<OrderFormProps> = ({ supplier, onBack, onComplete }) => {
  const { inventoryItems } = useInventoryItems();
  const { createOrder, addItemToOrder, removeItemFromOrder, updateItemQuantity, submitOrder, currentOrder } = useOrders();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  // Create the order if it doesn't exist
  React.useEffect(() => {
    if (!currentOrder || currentOrder.supplierId !== supplier.id) {
      createOrder(supplier.id, supplier.name);
    }
  }, [supplier, currentOrder, createOrder]);
  
  const handleAddToOrder = (item: InventoryItem) => {
    const orderItem: OrderItem = {
      itemId: item.id,
      code: item.code,
      name: item.name,
      quantity: 1,
      price: item.price,
      total: item.price
    };
    
    addItemToOrder(orderItem);
    setIsProductDialogOpen(false);
  };
  
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateItemQuantity(itemId, quantity);
  };
  
  const handleSubmitOrder = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      toast({
        title: "Cannot Submit Order",
        description: "Please add at least one item to the order.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    try {
      // Submit the order to local storage first
      const submittedOrder = submitOrder(notes);
      
      if (!submittedOrder) {
        throw new Error("Failed to submit order");
      }
      
      // Format the order for email
      const orderHtml = formatOrderHtml(submittedOrder.items, submittedOrder.total, notes);
      
      // Send the email using the edge function
      const emailResponse = await sendOrderEmail(supplier, orderHtml);
      
      if (emailResponse.error) {
        throw new Error(emailResponse.error);
      }
      
      toast({
        title: "Order Submitted",
        description: "Order has been submitted and email sent to supplier.",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error Submitting Order",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const formatOrderHtml = (items: OrderItem[], total: number, notes: string) => {
    return `
      <h2>Purchase Order</h2>
      <p><strong>Supplier:</strong> ${supplier.name}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      
      <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th align="left">Code</th>
            <th align="left">Product</th>
            <th align="center">Quantity</th>
            <th align="right">Unit Price</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.code}</td>
              <td>${item.name}</td>
              <td align="center">${item.quantity}</td>
              <td align="right">$${item.price.toFixed(2)}</td>
              <td align="right">$${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f3f4f6;">
            <td colspan="4" align="right">Total:</td>
            <td align="right">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      ${notes ? `
        <h3>Notes</h3>
        <p>${notes.replace(/\n/g, '<br>')}</p>
      ` : ''}
      
      <p>Please confirm receipt of this order and provide an estimated delivery date.</p>
      <p>Thank you for your business.</p>
    `;
  };
  
  const sendOrderEmail = async (supplier: Supplier, orderHtml: string) => {
    const functionUrl = getEdgeFunctionUrl('email-integration');
    
    try {
      const token = localStorage.getItem('supabase.auth.token');
      
      const response = await fetch(`${functionUrl}/send-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${JSON.parse(token).access_token}` : '',
        },
        body: JSON.stringify({
          supplierEmail: supplier.email,
          supplierName: supplier.name,
          subject: `Purchase Order - ${new Date().toLocaleDateString()}`,
          orderHtml
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending order email:", error);
      return { error: "Failed to send email. Please try again later." };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">New Order</h2>
            <p className="text-muted-foreground">Creating order for {supplier.name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsProductDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Products
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          {!currentOrder || currentOrder.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Items Added</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Your order is empty. Click "Add Products" to select products from your inventory.
              </p>
              <Button className="mt-4" onClick={() => setIsProductDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Products
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrder?.items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell className="font-mono text-sm">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 1)}
                          className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemFromOrder(item.itemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${currentOrder?.total.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Notes</span>
            </div>
            <Textarea
              placeholder="Add any specific instructions or notes for this order..."
              className="min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitOrder} 
              disabled={!currentOrder || currentOrder.items.length === 0 || isSending}
              className="gap-2"
            >
              {isSending ? 'Sending...' : (
                <>
                  <Mail className="h-4 w-4" />
                  Submit Order
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add Products to Order
            </DialogTitle>
          </DialogHeader>
          <ProductCatalog onAddToOrder={handleAddToOrder} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderForm;
