
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Supplier, InventoryItem } from '@/types/inventory';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useToast } from '@/components/ui/use-toast';
import { sendgridService } from '@/services/sendgridService';
import { Trash2, Plus } from 'lucide-react';

interface OrderLineItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

interface ManualOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({
  isOpen,
  onClose,
  supplier
}) => {
  const { inventoryItems } = useInventoryItems();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [capricornNumber, setCapricornNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter items for this supplier
  const supplierItems = inventoryItems.filter(item => item.supplierId === supplier.id);

  // Calculate total order price
  const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  const addOrderItem = () => {
    const newItem: OrderLineItem = {
      id: Date.now().toString(),
      itemId: '',
      itemName: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (id: string, field: keyof OrderLineItem, value: string | number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'itemId' && typeof value === 'string') {
          const selectedItem = supplierItems.find(i => i.id === value);
          const updatedItem = {
            ...item,
            [field]: value,
            itemName: selectedItem?.name || '',
            price: selectedItem?.price || 0
          };
          updatedItem.total = updatedItem.quantity * updatedItem.price;
          return updatedItem;
        }
        
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or price changed
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeOrderItem = (id: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
  };

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the order.",
        variant: "destructive"
      });
      return;
    }

    const invalidItems = orderItems.filter(item => !item.itemId || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast({
        title: "Invalid Items",
        description: "Please ensure all items have a product selected and quantity greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order details
      const orderDetails = orderItems.map(item => {
        const inventoryItem = supplierItems.find(i => i.id === item.itemId);
        return {
          product: item.itemName,
          code: inventoryItem?.code || 'N/A',
          quantity: item.quantity,
          price: item.price.toFixed(2),
          total: item.total.toFixed(2),
          notes: item.notes || ''
        };
      });

      // Create email content
      const emailSubject = `New Parts Order from WorkshopBase${poNumber ? ` - PO: ${poNumber}` : ''}`;
      const emailContent = `
        <h2>New Parts Order Request</h2>
        <p>Dear ${supplier.contactPerson || supplier.name},</p>
        <p>We would like to place the following order:</p>
        
        ${poNumber ? `<p><strong>Purchase Order Number:</strong> ${poNumber}</p>` : ''}
        ${capricornNumber ? `<p><strong>Capricorn Number:</strong> ${capricornNumber}</p>` : ''}
        
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Code</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.product}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.code}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.total}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.notes}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Order Value:</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${orderTotal.toFixed(2)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"></td>
            </tr>
          </tfoot>
        </table>
        
        ${orderNotes ? `<p><strong>Additional Notes:</strong><br>${orderNotes.replace(/\n/g, '<br>')}</p>` : ''}
        
        <p>Please confirm availability and provide pricing and delivery information.</p>
        <p>Thank you for your service.</p>
        <p>Best regards,<br>WorkshopBase Team</p>
      `;

      // Send email using SendGrid service
      const result = await sendgridService.sendEmail(
        'WorkshopBase',
        { email: supplier.email, name: supplier.contactPerson || supplier.name },
        {
          to: { email: supplier.email, name: supplier.contactPerson || supplier.name },
          subject: emailSubject,
          html: emailContent,
          text: emailContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
        }
      );

      if (result.success) {
        toast({
          title: "Order Sent",
          description: `Order has been sent to ${supplier.name} successfully.`,
        });
        
        // Reset form and close
        setOrderItems([]);
        setOrderNotes('');
        setCapricornNumber('');
        setPoNumber('');
        onClose();
      } else {
        throw new Error(result.error?.message || 'Failed to send order');
      }
    } catch (error) {
      console.error('Error sending order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to send order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order - {supplier.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Order Reference Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="poNumber">Purchase Order Number</Label>
              <Input
                id="poNumber"
                placeholder="Enter PO number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capricornNumber">Capricorn Number</Label>
              <Input
                id="capricornNumber"
                placeholder="Enter Capricorn number"
                value={capricornNumber}
                onChange={(e) => setCapricornNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Order Items</Label>
              <Button onClick={addOrderItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to start building your order.
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border rounded-lg">
                    <div className="md:col-span-3">
                      <Label className="text-sm">Product</Label>
                      <Select 
                        value={item.itemId} 
                        onValueChange={(value) => updateOrderItem(item.id, 'itemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierItems.map(inventoryItem => (
                            <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                              {inventoryItem.name} ({inventoryItem.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label className="text-sm">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label className="text-sm">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateOrderItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label className="text-sm">Total</Label>
                      <Input
                        type="text"
                        value={`$${item.total.toFixed(2)}`}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label className="text-sm">Notes (Optional)</Label>
                      <Input
                        placeholder="Special requirements..."
                        value={item.notes || ''}
                        onChange={(e) => updateOrderItem(item.id, 'notes', e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-1 flex items-end">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeOrderItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Order Total */}
                {orderItems.length > 0 && (
                  <div className="flex justify-end p-4 bg-gray-50 rounded-lg">
                    <div className="text-right">
                      <Label className="text-lg font-semibold">Order Total: ${orderTotal.toFixed(2)}</Label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Order Notes */}
          <div className="space-y-2">
            <Label htmlFor="orderNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="orderNotes"
              placeholder="Add any additional information about this order..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={submitOrder} 
              disabled={isSubmitting || orderItems.length === 0}
            >
              {isSubmitting ? 'Sending...' : 'Send Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualOrderForm;
