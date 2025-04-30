
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEzyParts } from '../../../contexts/EzyPartsContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertCircle, ShoppingCart, Package } from 'lucide-react';
import { CartTable } from './CartTable';
import { OrderForm } from './OrderForm';
import QuoteProductProcessor from './QuoteProductProcessor';
import { CartItem, OrderFormValues, OrderResponseState } from './types';
import { formatCurrency, calculateSubtotal, calculateTotalItems, calculateTotalQuantity } from './utils';
import { QuoteResponse } from '@/types/ezyparts';

const QuoteHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentQuote, setCurrentQuote, checkInventory, submitOrder, lastError, isLoading } = useEzyParts();
  const { credentials } = useEzyParts();

  const [activeTab, setActiveTab] = useState<'order' | 'inventory'>('order');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderFormValues, setOrderFormValues] = useState<OrderFormValues>({
    purchaseOrder: '',
    orderNotes: '',
    deliveryType: '1',
    forceOrder: false
  });
  const [orderResponse, setOrderResponse] = useState<OrderResponseState | null>(null);

  // Initialize cart items from the current quote
  useEffect(() => {
    if (currentQuote && currentQuote.parts && currentQuote.parts.length > 0) {
      const initialCartItems: CartItem[] = currentQuote.parts.map(part => ({
        ...part,
        isSelected: true
      }));
      setCartItems(initialCartItems);
    }
  }, [currentQuote]);

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
            const quoteData = data.quote_data as unknown as QuoteResponse;
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
      const orderRequest = {
        inputMetaData: {
          checkCurrentPosition: !orderFormValues.forceOrder
        },
        headers: {
          customerAccount: currentQuote.headers.customerAccount,
          customerId: currentQuote.headers.customerId,
          password: credentials.password,
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
  }, [cartItems, currentQuote, orderFormValues, credentials.password, submitOrder]);

  const handleBackToSearch = () => {
    navigate('/ezyparts/search');
  };

  const handleQuoteProcessingComplete = () => {
    setActiveTab('order');
  };

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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'order' | 'inventory')}>
        <TabsList className="mb-4">
          <TabsTrigger value="order" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Order Parts
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Add to Inventory
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="order">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Selected Parts</h2>
                  <p className="text-sm text-gray-500">
                    Parts selected from EzyParts for {currentQuote?.headers.make} {currentQuote?.headers.model}
                  </p>
                </div>
                <div className="p-1">
                  <div className="rounded-md overflow-hidden">
                    <CartTable
                      items={cartItems}
                      onToggleSelection={toggleItemSelection}
                      onUpdateQuantity={updateItemQuantity}
                    />
                    
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Subtotal (ex. GST):</span>
                        <span className="font-bold">{formatCurrency(calculateSubtotal(cartItems))}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">GST:</span>
                        <span>{formatCurrency(calculateSubtotal(cartItems) * 0.1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total (inc. GST):</span>
                        <span className="font-bold">{formatCurrency(calculateSubtotal(cartItems) * 1.1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4">
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
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <OrderForm
                values={orderFormValues}
                onChange={(values) => setOrderFormValues(prev => ({ ...prev, ...values }))}
                onSubmit={handleSubmitOrder}
                onBack={handleBackToSearch}
                disabled={isLoading || cartItems.filter(item => item.isSelected).length === 0}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <QuoteProductProcessor 
            quote={currentQuote}
            onComplete={handleQuoteProcessingComplete}
            onBack={() => setActiveTab('order')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteHandler;
