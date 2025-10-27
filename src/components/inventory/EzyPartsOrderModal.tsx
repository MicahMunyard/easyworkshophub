
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useEzyPartsOrder } from '@/hooks/ezyparts/useEzyPartsOrder';
import { InventoryItem } from '@/types/inventory';
import { ShoppingCart, Plus, Minus, Package, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEzyPartsCredentials } from '@/hooks/ezyparts/useEzyPartsCredentials';

interface OrderLineItem {
  inventoryItem: InventoryItem;
  quantity: number;
  nettPriceEach: number;
  retailPriceEa: number;
  sku: string;
}

interface EzyPartsOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillItem?: InventoryItem;
  onOrderSuccess?: (orderNumber: string, items: OrderLineItem[]) => void;
}

const EzyPartsOrderModal: React.FC<EzyPartsOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  prefillItem,
  onOrderSuccess 
}) => {
  const { inventoryItems } = useInventoryItems();
  const { submitOrder, isSubmitting } = useEzyPartsOrder();
  const { credentials, hasCredentials, loading, refetch } = useEzyPartsCredentials();
  const { toast } = useToast();
  
  const [selectedItems, setSelectedItems] = useState<OrderLineItem[]>([]);
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    customerAddress: '',
    customerSuburb: '',
    purchaseOrder: '',
    orderNotes: '',
    deliveryType: '1' as '1' | '2', // 1 = Delivery, 2 = Pick-Up
  });
  const [showDiscrepancies, setShowDiscrepancies] = useState(false);
  const [orderDiscrepancies, setOrderDiscrepancies] = useState<any>(null);
  const [forceOrder, setForceOrder] = useState(false);

  // Filter inventory items that came from EzyParts (Burson Auto Parts)
  const ezyPartsItems = inventoryItems.filter(item => 
    item.supplierId === 'burson-auto-parts' || 
    item.supplier === 'Burson Auto Parts'
  );

  // Auto-select prefill item when modal opens
  useEffect(() => {
    if (isOpen && prefillItem && selectedItems.length === 0) {
      const orderItem: OrderLineItem = {
        inventoryItem: prefillItem,
        quantity: prefillItem.quotedQuantity || 1,
        nettPriceEach: prefillItem.price || 0,
        retailPriceEa: prefillItem.retailPrice || (prefillItem.price ? prefillItem.price * 1.2 : 0),
        sku: extractSkuFromDescription(prefillItem.description) || prefillItem.code
      };
      setSelectedItems([orderItem]);
    }
  }, [isOpen, prefillItem]);

  const addItemToOrder = (item: InventoryItem) => {
    const existingItem = selectedItems.find(selected => selected.inventoryItem.id === item.id);
    
    if (existingItem) {
      // Increase quantity if already selected
      updateItemQuantity(item.id, existingItem.quantity + 1);
    } else {
      // Add new item with default quantity of 1
      const orderItem: OrderLineItem = {
        inventoryItem: item,
        quantity: 1,
        nettPriceEach: item.price || 0,
        retailPriceEa: item.price ? item.price * 1.2 : 0, // Estimate 20% markup
        sku: extractSkuFromDescription(item.description) || item.code
      };
      setSelectedItems([...selectedItems, orderItem]);
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.inventoryItem.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }
    
    setSelectedItems(selectedItems.map(item => 
      item.inventoryItem.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.inventoryItem.id === itemId 
        ? { ...item, nettPriceEach: newPrice }
        : item
    ));
  };

  // Extract SKU from item description (EzyParts items often have SKU in description)
  const extractSkuFromDescription = (description: string): string | null => {
    if (!description) return null;
    
    // Updated regex to handle SKUs with hyphens, numbers, and special characters
    const skuMatch = description.match(/SKU:\s*([\w-]+)/i);
    
    if (skuMatch && skuMatch[1]) {
      return skuMatch[1].trim();
    }
    
    return null;
  };

  const calculateOrderTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * item.nettPriceEach), 0);
  };

  const handleSubmitOrder = async () => {
    // Check if credentials are still loading
    if (loading) {
      toast({
        title: "Loading",
        description: "Checking EzyParts credentials...",
      });
      return;
    }

    // Comprehensive validation before submission
    const validationErrors: string[] = [];
    
    // Check for selected items
    if (selectedItems.length === 0) {
      validationErrors.push("Please select at least one item to order");
    }
    
    // Check EzyParts credentials - attempt refetch if missing
    if (!hasCredentials) {
      await refetch();
      
      // Re-check after refetch
      if (!hasCredentials) {
        validationErrors.push("EzyParts credentials not configured. Use the 'Configure EzyParts' button in the Inventory page header.");
      }
    }
    
    // Check customer name (required)
    if (!orderDetails.customerName.trim()) {
      validationErrors.push("Customer name is required");
    }
    
    // Check customer address (MANDATORY per EzyParts API)
    if (!orderDetails.customerAddress.trim()) {
      validationErrors.push("Customer address is required (mandatory field for EzyParts)");
    }
    
    // Validate SKUs for all items
    const itemsWithoutSku = selectedItems.filter(item => {
      const sku = extractSkuFromDescription(item.inventoryItem.description);
      return !sku || !item.sku;
    });
    
    if (itemsWithoutSku.length > 0) {
      validationErrors.push(
        `${itemsWithoutSku.length} item(s) missing SKU information. All items must have SKU in their description.`
      );
      console.error('Items without valid SKU:', itemsWithoutSku.map(item => ({
        name: item.inventoryItem.name,
        description: item.inventoryItem.description,
        extractedSku: extractSkuFromDescription(item.inventoryItem.description)
      })));
    }
    
    // Validate quantities and prices
    const invalidItems = selectedItems.filter(item => 
      item.quantity <= 0 || item.nettPriceEach < 0
    );
    
    if (invalidItems.length > 0) {
      validationErrors.push("All items must have valid quantity (> 0) and price (>= 0)");
    }
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      toast({
        title: "Cannot Submit Order",
        description: (
          <div className="space-y-1">
            {validationErrors.map((error, i) => (
              <div key={i} className="text-sm">• {error}</div>
            ))}
          </div>
        ),
        variant: "destructive",
        duration: 6000
      });
      return;
    }

    try {
      // Log the order data being sent for debugging
      console.log('=== Submitting EzyParts Order ===');
      console.log('Customer:', {
        name: orderDetails.customerName,
        address: orderDetails.customerAddress,
        suburb: orderDetails.customerSuburb,
        deliveryType: orderDetails.deliveryType
      });
      console.log('Items:', selectedItems.map(item => ({
        name: item.inventoryItem.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.nettPriceEach
      })));
      
      // Prepare order data according to EzyParts API specification
      const orderData = {
        parts: selectedItems.map(item => ({
          qty: item.quantity,
          sku: item.sku,
          nettPriceEach: item.nettPriceEach,
          retailPriceEa: item.retailPriceEa
        })),
        customerName: orderDetails.customerName,
        customerAddress: orderDetails.customerAddress,
        customerSuburb: orderDetails.customerSuburb,
        purchaseOrder: orderDetails.purchaseOrder || undefined,
        orderNotes: orderDetails.orderNotes || undefined,
        deliveryType: orderDetails.deliveryType,
        forceOrder: forceOrder,
        ezypartsCredentials: {
          customerAccount: credentials!.customer_account,
          customerId: credentials!.customer_id,
          password: credentials!.password
        }
      };

      console.log('Order payload:', JSON.stringify(orderData, null, 2));

      const response = await submitOrder(orderData);

      if (response.success) {
        // Call success callback to update inventory items
        if (onOrderSuccess && response.salesOrderNumber) {
          onOrderSuccess(response.salesOrderNumber, selectedItems);
        }

        if (response.failedItems && response.failedItems.length > 0) {
          // Handle discrepancies
          setOrderDiscrepancies(response);
          setShowDiscrepancies(true);
          
          toast({
            title: "Order Submitted with Issues",
            description: `Order ${response.salesOrderNumber} created, but ${response.failedItems.length} items had discrepancies.`,
            variant: "destructive"
          });
        } else {
          // Complete success
          toast({
            title: "Order Submitted Successfully",
            description: `Order ${response.salesOrderNumber} has been submitted to EzyParts.`,
          });
          
          // Reset form and close modal
          setSelectedItems([]);
          setOrderDetails({
            customerName: '',
            customerAddress: '',
            customerSuburb: '',
            purchaseOrder: '',
            orderNotes: '',
            deliveryType: '1',
          });
          setShowDiscrepancies(false);
          setOrderDiscrepancies(null);
          setForceOrder(false);
          onClose();
        }
      }
    } catch (error) {
      console.error('Order submission error:', error);
      
      // Try to extract detailed error information
      let errorMessage = "Failed to submit order to EzyParts";
      let errorDetails = null;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Try to parse structured error from message
        try {
          const jsonMatch = error.message.match(/\{.*\}/s);
          if (jsonMatch) {
            errorDetails = JSON.parse(jsonMatch[0]);
            if (errorDetails.message) {
              errorMessage = errorDetails.message;
            }
          }
        } catch (parseError) {
          // Use original error message
        }
      }
      
      toast({
        title: "Order Submission Failed",
        description: (
          <div className="space-y-2">
            <div>{errorMessage}</div>
            {errorDetails && errorDetails.details && (
              <div className="text-xs opacity-75 mt-2 max-h-32 overflow-auto">
                <pre>{JSON.stringify(errorDetails.details, null, 2)}</pre>
              </div>
            )}
          </div>
        ),
        variant: "destructive",
        duration: 8000
      });
    }
  };

  const handleForceOrder = async () => {
    setForceOrder(true);
    await handleSubmitOrder();
  };

  const handleResolveDiscrepancies = () => {
    if (orderDiscrepancies && orderDiscrepancies.failedItems) {
      // Update selected items with corrected prices from EzyParts
      const updatedItems = selectedItems.map(selectedItem => {
        const failedItem = orderDiscrepancies.failedItems.find(
          (failed: any) => failed.sku === selectedItem.sku
        );
        
        if (failedItem) {
          return {
            ...selectedItem,
            nettPriceEach: failedItem.nettPriceEach,
            retailPriceEa: failedItem.retailPriceEa
          };
        }
        
        return selectedItem;
      });
      
      setSelectedItems(updatedItems);
      setShowDiscrepancies(false);
      setOrderDiscrepancies(null);
      
      toast({
        title: "Prices Updated",
        description: "Item prices have been updated with current EzyParts pricing.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            EzyParts Order Placement
          </DialogTitle>
        </DialogHeader>

        {showDiscrepancies && orderDiscrepancies && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Order Discrepancies Detected</AlertTitle>
            <AlertDescription className="text-orange-700">
              <p className="mb-3">
                Order {orderDiscrepancies.salesOrderNumber} was created, but some items had pricing or availability issues:
              </p>
              <div className="space-y-2 mb-4">
                {orderDiscrepancies.failedItems.map((item: any, index: number) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <p className="font-medium">SKU: {item.sku}</p>
                    <p className="text-sm text-red-600">Issue: {item.reason}</p>
                    <p className="text-sm">Updated Price: ${item.nettPriceEach}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleResolveDiscrepancies} size="sm">
                  Update Prices & Resubmit
                </Button>
                <Button onClick={handleForceOrder} variant="outline" size="sm">
                  Force Order Anyway
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Selection Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Available EzyParts Products</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select products from your inventory that were sourced from EzyParts
              </p>
            </div>

            {ezyPartsItems.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No EzyParts Products Found</AlertTitle>
                <AlertDescription>
                  You don't have any products from EzyParts in your inventory yet. 
                  Use the EzyParts search to add products first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ezyPartsItems.map((item) => {
                  const isSelected = selectedItems.some(selected => selected.inventoryItem.id === item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => addItemToOrder(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{item.code}</Badge>
                            {item.brand && (
                              <Badge variant="secondary">{item.brand}</Badge>
                            )}
                            <span className="text-sm font-medium">${item.price}</span>
                          </div>
                        </div>
                        <div className="ml-2">
                          {isSelected ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Details</h3>
            </div>

            {/* Selected Items */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Selected Items ({selectedItems.length})</Label>
              
              {selectedItems.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items selected yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedItems.map((orderItem) => (
                    <div key={orderItem.inventoryItem.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium">{orderItem.inventoryItem.name}</h5>
                          <p className="text-sm text-muted-foreground">SKU: {orderItem.sku}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItemFromOrder(orderItem.inventoryItem.id)}
                        >
                          ×
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => updateItemQuantity(orderItem.inventoryItem.id, orderItem.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input 
                              type="number" 
                              value={orderItem.quantity}
                              onChange={(e) => updateItemQuantity(orderItem.inventoryItem.id, parseInt(e.target.value) || 0)}
                              className="h-6 text-center"
                              min="1"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => updateItemQuantity(orderItem.inventoryItem.id, orderItem.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Unit Price</Label>
                          <Input 
                            type="number" 
                            value={orderItem.nettPriceEach}
                            onChange={(e) => updateItemPrice(orderItem.inventoryItem.id, parseFloat(e.target.value) || 0)}
                            className="h-6"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Total</Label>
                          <div className="h-6 flex items-center text-sm font-medium">
                            ${(orderItem.quantity * orderItem.nettPriceEach).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Customer Information</Label>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="customerName">
                    Customer Name * 
                    <span className="text-xs text-muted-foreground ml-2">
                      ({orderDetails.customerName.length}/34)
                    </span>
                  </Label>
                  <Input
                    id="customerName"
                    value={orderDetails.customerName}
                    onChange={(e) => setOrderDetails({...orderDetails, customerName: e.target.value})}
                    placeholder="Enter customer name"
                    maxLength={34}
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerAddress">
                    Delivery Address * 
                    <span className="text-xs text-muted-foreground ml-2">
                      ({orderDetails.customerAddress.length}/90)
                    </span>
                  </Label>
                  <Input
                    id="customerAddress"
                    value={orderDetails.customerAddress}
                    onChange={(e) => setOrderDetails({...orderDetails, customerAddress: e.target.value})}
                    placeholder="Enter delivery address"
                    maxLength={90}
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerSuburb">Suburb</Label>
                  <Input
                    id="customerSuburb"
                    value={orderDetails.customerSuburb}
                    onChange={(e) => setOrderDetails({...orderDetails, customerSuburb: e.target.value})}
                    placeholder="Enter suburb"
                  />
                </div>
                
                <div>
                  <Label htmlFor="purchaseOrder">
                    Purchase Order 
                    <span className="text-xs text-muted-foreground ml-2">
                      ({orderDetails.purchaseOrder.length}/15)
                    </span>
                  </Label>
                  <Input
                    id="purchaseOrder"
                    value={orderDetails.purchaseOrder}
                    onChange={(e) => setOrderDetails({...orderDetails, purchaseOrder: e.target.value})}
                    placeholder="PO reference"
                    maxLength={15}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deliveryType">Delivery Method</Label>
                  <Select 
                    value={orderDetails.deliveryType} 
                    onValueChange={(value: '1' | '2') => setOrderDetails({...orderDetails, deliveryType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Delivery</SelectItem>
                      <SelectItem value="2">Pick-Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="orderNotes">Order Notes</Label>
                  <Textarea
                    id="orderNotes"
                    value={orderDetails.orderNotes}
                    onChange={(e) => setOrderDetails({...orderDetails, orderNotes: e.target.value})}
                    placeholder="Additional notes for this order"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Order Total</Label>
                <span className="text-xl font-bold">${calculateOrderTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitOrder} 
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Order to EzyParts'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                * Orders are submitted directly to EzyParts for processing. 
                Any pricing or stock discrepancies will be reported for review.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EzyPartsOrderModal;
