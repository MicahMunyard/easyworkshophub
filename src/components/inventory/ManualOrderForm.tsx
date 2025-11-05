
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
import { supabase } from '@/integrations/supabase/client';
import { useWorkshop } from '@/hooks/useWorkshop';
import { Trash2, Plus } from 'lucide-react';

interface OrderLineItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  // Manual entry fields
  isManualEntry?: boolean;
  productCode?: string;
  description?: string;
  category?: string;
  brand?: string;
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
  const { inventoryItems, addInventoryItem, updateItemOrderStatus } = useInventoryItems();
  const { workshop } = useWorkshop();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [capricornNumber, setCapricornNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Workshop details (auto-populated from Workshop Setup)
  const [workshopName, setWorkshopName] = useState('');
  const [workshopEmail, setWorkshopEmail] = useState('');
  const [workshopAddress, setWorkshopAddress] = useState('');

  // Auto-populate workshop details when workshop data loads
  React.useEffect(() => {
    if (workshop) {
      setWorkshopName(workshop.name || '');
      setWorkshopEmail(workshop.email || '');
      setWorkshopAddress(workshop.address || '');
    }
  }, [workshop]);

  // Filter items for this supplier
  const supplierItems = inventoryItems.filter(item => item.supplierId === supplier.id);

  // Calculate total order price
  const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  const addOrderItem = (isManual: boolean = false) => {
    const newItem: OrderLineItem = {
      id: Date.now().toString(),
      itemId: '',
      itemName: '',
      quantity: 1,
      price: 0,
      total: 0,
      isManualEntry: isManual
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

    // Validate items
    const invalidItems = orderItems.filter(item => {
      if (item.isManualEntry) {
        return !item.itemName || item.quantity <= 0 || item.price < 0;
      }
      return !item.itemId || item.quantity <= 0;
    });
    
    if (invalidItems.length > 0) {
      toast({
        title: "Invalid Items",
        description: "Please ensure all items have required fields filled and valid quantities.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create inventory items for manual entries
      const manualItems = orderItems.filter(item => item.isManualEntry);
      const createdItemIds = new Map<string, string>();
      
      for (const manualItem of manualItems) {
        const newInventoryItem = await addInventoryItem({
          code: manualItem.productCode || `${supplier.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          name: manualItem.itemName,
          description: manualItem.description || manualItem.itemName,
          category: manualItem.category || 'General',
          supplier: supplier.name,
          supplierId: supplier.id,
          inStock: 0,
          minStock: 5,
          price: manualItem.price,
          brand: manualItem.brand,
          orderStatus: 'on_order',
          orderedQuantity: manualItem.quantity,
          orderDate: new Date().toISOString()
        });
        
        if (newInventoryItem) {
          createdItemIds.set(manualItem.id, newInventoryItem.id);
          
          // Update order status for the newly created item
          await updateItemOrderStatus(newInventoryItem.id, 'on_order', {
            orderedQuantity: manualItem.quantity,
            orderDate: new Date().toISOString()
          });
        }
      }
      
      // Update order status for existing items
      const existingItems = orderItems.filter(item => !item.isManualEntry);
      for (const existingItem of existingItems) {
        await updateItemOrderStatus(existingItem.itemId, 'on_order', {
          orderedQuantity: existingItem.quantity,
          orderDate: new Date().toISOString()
        });
      }

      // Generate order details
      const orderDetails = orderItems.map(item => {
        if (item.isManualEntry) {
          return {
            product: item.itemName,
            code: item.productCode || 'NEW',
            quantity: item.quantity,
            price: item.price.toFixed(2),
            total: item.total.toFixed(2),
            notes: item.notes || ''
          };
        } else {
          const inventoryItem = supplierItems.find(i => i.id === item.itemId);
          return {
            product: item.itemName,
            code: inventoryItem?.code || 'N/A',
            quantity: item.quantity,
            price: item.price.toFixed(2),
            total: item.total.toFixed(2),
            notes: item.notes || ''
          };
        }
      });

      // Create email content
      const emailSubject = `New Parts Order from ${workshopName}${poNumber ? ` - PO: ${poNumber}` : ''}`;
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          ${workshop?.logo ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${workshop.logo}" alt="${workshopName}" style="max-height: 100px; max-width: 300px;" />
            </div>
          ` : ''}
          
          <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New Parts Order Request</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${workshopName}</p>
            ${workshopEmail ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${workshopEmail}</p>` : ''}
            ${workshopAddress ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${workshopAddress}</p>` : ''}
          </div>
          
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
        
        ${orderNotes ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Additional Notes:</strong></p>
            <p style="margin: 5px 0 0 0;">${orderNotes.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}
        
        <p style="margin-top: 30px;">Please confirm receipt and provide delivery information.</p>
        <p>Thank you,<br/>${workshopName}</p>
        </div>
      `;

      // Send email using Resend via edge function
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(
        'resend-email',
        {
          body: {
            workshopName,
            options: {
              to: supplier.email,
              subject: emailSubject,
              html: emailContent,
              text: emailContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
            },
            replyToEmail: workshopEmail || workshop?.email
          }
        }
      );

      const result = emailError 
        ? { success: false, error: emailError }
        : emailResult;

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
        // Reset workshop fields to defaults
        setWorkshopName(workshop?.name || '');
        setWorkshopEmail(workshop?.email || '');
        setWorkshopAddress(workshop?.address || '');
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
          {/* Workshop Details */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-sm font-semibold text-foreground">Workshop Details</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="workshopName">Workshop Name</Label>
                <Input
                  id="workshopName"
                  placeholder="Enter workshop name"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workshopEmail">Email</Label>
                <Input
                  id="workshopEmail"
                  type="email"
                  placeholder="Enter workshop email"
                  value={workshopEmail}
                  onChange={(e) => setWorkshopEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workshopAddress">Address</Label>
                <Input
                  id="workshopAddress"
                  placeholder="Enter workshop address"
                  value={workshopAddress}
                  onChange={(e) => setWorkshopAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Order Reference Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
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
              <div className="flex gap-2">
                <Button onClick={() => addOrderItem(false)} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  From Inventory
                </Button>
                <Button onClick={() => addOrderItem(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Product
                </Button>
              </div>
            </div>
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to start building your order.
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.isManualEntry ? '🆕 New Product' : '📦 From Inventory'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeOrderItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {item.isManualEntry ? (
                      // Manual entry fields
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label className="text-sm">Product Name *</Label>
                          <Input
                            placeholder="Enter product name"
                            value={item.itemName}
                            onChange={(e) => updateOrderItem(item.id, 'itemName', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Product Code</Label>
                          <Input
                            placeholder="Auto-generated if empty"
                            value={item.productCode || ''}
                            onChange={(e) => updateOrderItem(item.id, 'productCode', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Category</Label>
                          <Input
                            placeholder="e.g., Oil, Filters"
                            value={item.category || ''}
                            onChange={(e) => updateOrderItem(item.id, 'category', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Brand</Label>
                          <Input
                            placeholder="Product brand"
                            value={item.brand || ''}
                            onChange={(e) => updateOrderItem(item.id, 'brand', e.target.value)}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label className="text-sm">Description</Label>
                          <Textarea
                            placeholder="Product description"
                            value={item.description || ''}
                            onChange={(e) => updateOrderItem(item.id, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Price *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateOrderItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Total</Label>
                          <Input
                            type="text"
                            value={`$${item.total.toFixed(2)}`}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Notes</Label>
                          <Input
                            placeholder="Special requirements..."
                            value={item.notes || ''}
                            onChange={(e) => updateOrderItem(item.id, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      // Existing product selection
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
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
                            className="bg-muted"
                          />
                        </div>
                        
                        <div className="md:col-span-3">
                          <Label className="text-sm">Notes</Label>
                          <Input
                            placeholder="Special requirements..."
                            value={item.notes || ''}
                            onChange={(e) => updateOrderItem(item.id, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
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
