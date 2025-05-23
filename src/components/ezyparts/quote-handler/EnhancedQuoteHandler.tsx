
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertCircle, ShoppingCart, Package, CheckCircle, ArrowLeft } from 'lucide-react';
import { CartTable } from './CartTable';
import { OrderForm } from './OrderForm';
import QuoteProductProcessor from './QuoteProductProcessor';
import { CartItem, OrderFormValues, OrderResponseState } from './types';
import { formatCurrency, calculateSubtotal, calculateTotalItems, calculateTotalQuantity } from './utils';
import { QuoteResponse } from '@/types/ezyparts';

const EnhancedQuoteHandler: React.FC = () => {
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
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Load quote from URL parameter or database
  useEffect(() => {
    const quoteId = searchParams.get('quote_id');
    
    if (quoteId && !currentQuote) {
      loadQuoteFromDatabase(quoteId);
    } else if (!quoteId && !currentQuote) {
      // Try to load from localStorage as fallback
      const storedQuote = localStorage.getItem('ezyparts-current-quote');
      if (storedQuote) {
        try {
          const parsedQuote = JSON.parse(storedQuote);
          setCurrentQuote(parsedQuote);
        } catch (error) {
          console.error('Error parsing stored quote:', error);
          setQuoteError('Failed to load stored quote data');
        }
      } else {
        setQuoteError('No quote data available');
      }
    }
  }, [searchParams, currentQuote, setCurrentQuote]);

  // Initialize cart items from the current quote
  useEffect(() => {
    if (currentQuote && currentQuote.parts && currentQuote.parts.length > 0) {
      const initialCartItems: CartItem[] = currentQuote.parts.map(part => ({
        ...part,
        isSelected: true
      }));
      setCartItems(initialCartItems);
      setQuoteError(null); // Clear any previous errors
    }
  }, [currentQuote]);

  const loadQuoteFromDatabase = async (quoteId: string) => {
    setIsLoadingQuote(true);
    setQuoteError(null);
    
    try {
      const { data, error } = await supabase
        .from('ezyparts_quotes')
        .select('quote_data, created_at')
        .eq('id', quoteId)
        .single();
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data && data.quote_data) {
        const quoteData = data.quote_data as unknown as QuoteResponse;
        
        // Validate the quote data structure
        if (!quoteData.headers || !quoteData.parts) {
          throw new Error('Invalid quote data structure');
        }
        
        setCurrentQuote(quoteData);
        localStorage.setItem('ezyparts-current-quote', JSON.stringify(quoteData));
        
        console.log('Quote loaded successfully:', {
          vehicle: `${quoteData.headers.make} ${quoteData.headers.model}`,
          parts: quoteData.parts.length,
          created: data.created_at
        });
      } else {
        throw new Error('No quote data found in database');
      }
    } catch (error) {
      console.error('Error loading quote from database:', error);
      setQuoteError(error instanceof Error ? error.message : 'Failed to load quote');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const retryLoadQuote = () => {
    const quoteId = searchParams.get('quote_id');
    if (quoteId) {
      loadQuoteFromDatabase(quoteId);
    }
  };

  const toggleItemSelection = (index: number) => {
    setCartItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    
    setCartItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, qty: newQty, qtyChanged: true } : item
      )
    );
  };

  const handleCheckInventory = async () => {
    const selectedItems = cartItems.filter(item => item.isSelected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to check inventory.');
      return;
    }

    try {
      const inventoryResponse = await checkInventory({
        stores: [{ code: currentQuote!.headers.locationId }],
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
  };

  const handleSubmitOrder = async () => {
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
          customerAccount: currentQuote!.headers.customerAccount,
          customerId: currentQuote!.headers.customerId,
          password: credentials.password,
          locationId: currentQuote!.headers.locationId,
          locationName: currentQuote!.headers.locationName,
          customerName: currentQuote!.headers.customerName,
          customerAddress: currentQuote!.headers.customerAddress,
          customerSuburb: currentQuote!.headers.customerSuburb,
          purchaseOrderNumber: orderFormValues.purchaseOrder || currentQuote!.headers.purchaseOrderNumber,
          dateServed: new Date().toLocaleDateString('en-AU') + ' ' + new Date().toLocaleTimeString('en-AU'),
          repId: currentQuote!.headers.repId,
          encryptedVehicleId: currentQuote!.headers.encryptedVehicleId,
          rego: currentQuote!.headers.rego,
          make: currentQuote!.headers.make,
          model: currentQuote!.headers.model,
          deliveryType: orderFormValues.deliveryType,
          note: orderFormValues.orderNotes,
          host: currentQuote!.headers.host,
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
  };

  const handleBackToSearch = () => {
    navigate('/ezyparts/search');
  };

  const handleQuoteProcessingComplete = () => {
    setActiveTab('order');
    // Redirect to inventory with success message
    navigate('/inventory?tab=inventory&ezyparts_products=added');
  };

  // Loading state
  if (isLoadingQuote) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Loading EzyParts Quote</h3>
            <p className="text-muted-foreground">Please wait while we retrieve your quote data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (quoteError || !currentQuote) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Alert variant="destructive" className="mb-6 max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quote Loading Error</AlertTitle>
            <AlertDescription>
              {quoteError || 'No EzyParts quote data is available. Please search for a vehicle first.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4">
            <Button onClick={handleBackToSearch} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vehicle Search
            </Button>
            
            {searchParams.get('quote_id') && (
              <Button onClick={retryLoadQuote}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Loading Quote
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalItemCount = calculateTotalItems(cartItems);
  const totalQuantity = calculateTotalQuantity(cartItems);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            EzyParts Quote: {currentQuote.headers.make} {currentQuote.headers.model}
            {currentQuote.headers.rego && ` (${currentQuote.headers.rego})`}
          </h1>
          <p className="text-muted-foreground">
            Quote from {currentQuote.headers.locationName} • {currentQuote.headers.dateServed}
          </p>
        </div>
        
        <Button onClick={handleBackToSearch} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Search
        </Button>
      </div>

      {/* Success Message */}
      {orderResponse && (
        <Alert className={orderResponse.failedItems.length ? 'mb-6 bg-amber-50 border-amber-200' : 'mb-6 bg-green-50 border-green-200'}>
          <CheckCircle className="h-4 w-4" />
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

      {/* Error Display */}
      {lastError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{lastError.message}</AlertDescription>
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
              <Card>
                <CardHeader>
                  <CardTitle>Selected Parts</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Parts selected from EzyParts for {currentQuote.headers.make} {currentQuote.headers.model}
                  </p>
                </CardHeader>
                <CardContent className="p-1">
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
                </CardContent>
              </Card>
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

export default EnhancedQuoteHandler;
