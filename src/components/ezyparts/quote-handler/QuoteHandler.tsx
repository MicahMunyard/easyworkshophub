import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEzyParts } from '../../../contexts/EzyPartsContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { CartTable } from './CartTable';
import { OrderForm } from './OrderForm';
import { CartItem, OrderFormValues, OrderResponseState } from './types';
import { formatCurrency, calculateSubtotal, calculateTotalItems, calculateTotalQuantity } from './utils';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinusCircle, PlusCircle, SendHorizontal } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OrderSubmissionRequest, QuoteResponse } from '@/types/ezyparts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const QuoteHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentQuote, setCurrentQuote, checkInventory, submitOrder, lastError, isLoading } = useEzyParts();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderFormValues, setOrderFormValues] = useState<OrderFormValues>({
    purchaseOrder: '',
    orderNotes: '',
    deliveryType: '1',
    forceOrder: false
  });
  const [orderResponse, setOrderResponse] = useState<OrderResponseState | null>(null);

  useEffect(() => {
    const quoteId = searchParams.get('quote_id');
    
    if (quoteId && !currentQuote) {
      const fetchQuote = async () => {
        try {
          const { data, error } = await supabase
            .from('ezyparts_quotes')
            .select('quote_data')
            .eq('id', quoteId)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data && data.quote_data) {
            const quoteData = data.quote_data as QuoteResponse;
            setCurrentQuote(quoteData);
            localStorage.setItem('ezyparts-current-quote', JSON.stringify(quoteData));
          }
        } catch (error) {
          console.error('Error fetching quote:', error);
        }
      };
      
      fetchQuote();
    }
  }, [searchParams, currentQuote, setCurrentQuote]);

  if (!currentQuote) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertTitle>No Quote Available</AlertTitle>
          <AlertDescription>
            No EzyParts quote data is available. Please search for a vehicle first.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/ezyparts/search')}>
          Go to Vehicle Search
        </Button>
      </div>
    );
  }

  const toggleItemSelection = (index: number) => {
    setCartItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return; // Don't allow quantities less than 1
    
    setCartItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, qty: newQty, qtyChanged: true } : item
      )
    );
  };

  const handleCheckInventory = useCallback(async () => {
    const selectedItems = cartItems.filter(item => item.isSelected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to check inventory.');
      return;
    }

    try {
      const inventoryResponse = await checkInventory({
        stores: [{ code: currentQuote.headers.locationId }],
        parts: selectedItems.map(item => ({
          qty: item.qty,
          sku: item.sku
        }))
      });

      setCartItems(prev => {
        return prev.map(item => {
          const inventoryItem = inventoryResponse.inventory.find(inv => inv.sku === item.sku);
          if (inventoryItem) {
            const isAvailable = inventoryItem.available >= item.qty;
            return {
              ...item,
              inventoryChecked: true,
              isAvailable: isAvailable,
              availableQty: inventoryItem.available
            };
          }
          return item;
        });
      });
    } catch (error) {
      console.error('Error checking inventory:', error);
    }
  }, [cartItems, checkInventory, currentQuote]);

  const handleSubmitOrder = useCallback(async () => {
    const selectedItems = cartItems.filter(item => item.isSelected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to order.');
      return;
    }

    try {
      const orderRequest: OrderSubmissionRequest = {
        inputMetaData: {
          checkCurrentPosition: !orderFormValues.forceOrder
        },
        headers: {
          customerAccount: currentQuote.headers.customerAccount,
          customerId: currentQuote.headers.customerId,
          password: '',
          locationId: currentQuote.headers.locationId,
          locationName: currentQuote.headers.locationName,
          customerName: currentQuote.headers.customerName,
          customerAddress: currentQuote.headers.customerAddress,
          customerSuburb: currentQuote.headers.customerSuburb,
          purchaseOrderNumber: orderFormValues.purchaseOrder || currentQuote.headers.purchaseOrderNumber,
          dateServed: new Date().toLocaleDateString('en-AU') + ' ' + new Date().toLocaleTimeString('en-AU'),
          repId: currentQuote.headers.repId,
          encryptedVehicleId: currentQuote.headers.encryptedVehicleId,
          rego: currentQuote.headers.rego,
          make: currentQuote.headers.make,
          model: currentQuote.headers.model,
          deliveryType: orderFormValues.deliveryType,
          note: orderFormValues.orderNotes,
          host: currentQuote.headers.host,
          userAgent: 'Mozilla/5.0'
        },
        parts: selectedItems.map(item => ({
          qty: item.qty,
          sku: item.sku,
          nettPriceEach: item.nettPriceEach,
          retailPriceEa: item.retailPriceEa
        }))
      };

      const response = await submitOrder(orderRequest);

      setOrderResponse({
        salesOrderNumber: response.salesOrderNumber,
        successItems: response.successOrderLines,
        failedItems: response.failOrderLines.map(item => ({
          sku: item.sku,
          qty: item.qty,
          reason: item.reason
        }))
      });

    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }, [cartItems, currentQuote, orderFormValues, submitOrder]);

  const totalItemCount = calculateTotalItems(cartItems);
  const totalQuantity = calculateTotalQuantity(cartItems);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        EzyParts Quote: {currentQuote?.headers.make} {currentQuote?.headers.model}
        {currentQuote?.headers.rego && ` (${currentQuote.headers.rego})`}
      </h1>

      {lastError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{lastError.message}</AlertDescription>
        </Alert>
      )}

      {orderResponse && (
        <Alert className={orderResponse.failedItems.length ? 'mb-6 bg-amber-50' : 'mb-6 bg-green-50'}>
          <AlertTitle>
            {orderResponse.failedItems.length 
              ? 'Order Submitted with Issues' 
              : 'Order Successfully Submitted'}
          </AlertTitle>
          <AlertDescription>
            <p>Order Number: <strong>{orderResponse.salesOrderNumber}</strong></p>
            <p>Successfully ordered: {orderResponse.successItems.length} items</p>
            {orderResponse.failedItems.length > 0 && (
              <div className="mt-2">
                <p className="text-amber-700 font-semibold">Failed items: {orderResponse.failedItems.length}</p>
                <ul className="list-disc pl-5 mt-1">
                  {orderResponse.failedItems.map((item, idx) => (
                    <li key={idx}>
                      {item.sku} (Qty: {item.qty}) - {item.reason}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="bg-white hover:bg-gray-50 text-amber-700 border-amber-500 hover:text-amber-800"
                    onClick={() => {
                      setOrderFormValues(prev => ({ ...prev, forceOrder: true }));
                      setOrderResponse(null);
                    }}
                  >
                    Retry with Force Order
                  </Button>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Selected Parts</CardTitle>
              <CardDescription>
                Parts selected from EzyParts for {currentQuote?.headers.make} {currentQuote?.headers.model}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <CartTable
                  items={cartItems}
                  onToggleSelection={toggleItemSelection}
                  onUpdateQuantity={updateItemQuantity}
                />
                
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Subtotal (ex. GST):
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(calculateSubtotal(cartItems))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    GST:
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateSubtotal(cartItems) * 0.1)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Total (inc. GST):
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(calculateSubtotal(cartItems) * 1.1)}
                  </TableCell>
                </TableRow>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  {totalItemCount} item{totalItemCount !== 1 ? 's' : ''} selected 
                  ({totalQuantity} total unit{totalQuantity !== 1 ? 's' : ''})
                </div>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-blue-50 text-blue-600 border-blue-300"
                  onClick={handleCheckInventory}
                  disabled={isLoading || cartItems.filter(item => item.isSelected).length === 0}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <OrderForm
            values={orderFormValues}
            onChange={(values) => setOrderFormValues(prev => ({ ...prev, ...values }))}
            onSubmit={handleSubmitOrder}
            onBack={() => navigate('/ezyparts/search')}
            disabled={isLoading || cartItems.filter(item => item.isSelected).length === 0}
          />
        </div>
      </div>
      
      {currentQuote?.jobSheet && currentQuote.jobSheet.serviceOperations && currentQuote.jobSheet.serviceOperations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vehicle Service Information</CardTitle>
            <CardDescription>
              Service information for {currentQuote.headers.make} {currentQuote.headers.model}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="jobsheet">
              <TabsList>
                <TabsTrigger value="jobsheet">Job Sheet</TabsTrigger>
                {currentQuote.repairTimes && currentQuote.repairTimes.length > 0 && (
                  <TabsTrigger value="repairtimes">Repair Times</TabsTrigger>
                )}
                {currentQuote.recommendedParts && currentQuote.recommendedParts.length > 0 && (
                  <TabsTrigger value="recommended">Recommended Parts</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="jobsheet" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentQuote.jobSheet.conditions && (
                      <div>
                        <h3 className="font-semibold mb-1">Conditions</h3>
                        <p>{currentQuote.jobSheet.conditions}</p>
                      </div>
                    )}
                    
                    {currentQuote.jobSheet.standardSchedule && (
                      <div>
                        <h3 className="font-semibold mb-1">Standard Schedule</h3>
                        <p>{currentQuote.jobSheet.standardSchedule}</p>
                      </div>
                    )}
                    
                    {currentQuote.jobSheet.specialSchedule && (
                      <div>
                        <h3 className="font-semibold mb-1">Special Schedule</h3>
                        <p>{currentQuote.jobSheet.specialSchedule}</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentQuote.jobSheet.serviceOperations.map((op, idx) => (
                          <TableRow key={idx} className={op.lineType === 1 ? 'bg-gray-100 font-semibold' : ''}>
                            <TableCell>
                              {op.lineType === 1 ? op.heading : op.operationDescription}
                            </TableCell>
                            <TableCell>{op.operationType}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              
              {currentQuote.repairTimes && currentQuote.repairTimes.length > 0 && (
                <TabsContent value="repairtimes" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Operation</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead className="text-right">Time (hrs)</TableHead>
                          <TableHead className="text-right">Labor Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentQuote.repairTimes.map((repair, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <div className="font-medium">{repair.operationDescription}</div>
                              <div className="text-sm text-gray-500">Code: {repair.operationId}</div>
                            </TableCell>
                            <TableCell>{repair.operationAction}</TableCell>
                            <TableCell className="text-right">{repair.operationTime}</TableCell>
                            <TableCell className="text-right">{formatCurrency(repair.labourCostPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              )}
              
              {currentQuote.recommendedParts && currentQuote.recommendedParts.length > 0 && (
                <TabsContent value="recommended" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Grade/Type</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentQuote.recommendedParts.map((part, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{part.category}</TableCell>
                            <TableCell>{part.grade}</TableCell>
                            <TableCell className="text-right">
                              {part.liquidQty ? `${part.liquidQty} L` : 'N/A'}
                            </TableCell>
                            <TableCell>{part.longFootnote}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteHandler;
