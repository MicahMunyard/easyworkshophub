
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertCircle, Package, CheckCircle, ArrowLeft } from 'lucide-react';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { convertEzyPartsToInventoryItems } from '@/utils/inventory/ezyPartsIntegration';
import { QuoteResponse } from '@/types/ezyparts';

const EzyPartsSelection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentQuote, setCurrentQuote } = useEzyParts();
  const { addInventoryItem } = useInventoryItems();

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addedPartsCount, setAddedPartsCount] = useState(0);
  const [vehicleInfo, setVehicleInfo] = useState<string>('');

  // Extract vehicle info from URL parameters
  useEffect(() => {
    const rego = searchParams.get('rego');
    const state = searchParams.get('state');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    if (rego && state) {
      setVehicleInfo(`${rego} (${state})`);
    } else if (make && model) {
      setVehicleInfo(`${make} ${model}${year ? ` ${year}` : ''}`);
    }
  }, [searchParams]);

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
      }
    }
  }, [searchParams, currentQuote, setCurrentQuote]);

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

  const handleAddAllPartsToInventory = async () => {
    if (!currentQuote || !currentQuote.parts || currentQuote.parts.length === 0) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get the quote ID from URL params if available
      const quoteId = searchParams.get('quote_id');
      
      // Convert EzyParts parts to inventory items (as quoted items)
      const inventoryItems = convertEzyPartsToInventoryItems(currentQuote, quoteId || undefined);
      
      // Add each item to inventory
      let addedCount = 0;
      for (const item of inventoryItems) {
        await addInventoryItem(item);
        addedCount++;
      }
      
      setAddedPartsCount(addedCount);
      
      // Clear the current quote since parts have been processed
      setCurrentQuote(null);
      localStorage.removeItem('ezyparts-current-quote');
      
    } catch (error) {
      console.error('Error adding parts to inventory:', error);
      setQuoteError('Failed to add parts to inventory');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToSearch = () => {
    navigate('/ezyparts/search');
  };

  const handleGoToInventory = () => {
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
            <p className="text-muted-foreground">Please wait while we retrieve your parts selection...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - parts have been added
  if (addedPartsCount > 0) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-green-800">Parts Added Successfully!</h3>
            <p className="text-green-700 text-center mb-6">
              {addedPartsCount} part{addedPartsCount !== 1 ? 's' : ''} from EzyParts {vehicleInfo && `for ${vehicleInfo} `}
              have been added to your inventory and are ready for job invoicing.
            </p>
            
            <div className="flex gap-4">
              <Button onClick={handleGoToInventory} className="bg-green-600 hover:bg-green-700">
                <Package className="mr-2 h-4 w-4" />
                View in Inventory
              </Button>
              <Button onClick={handleBackToSearch} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Search Another Vehicle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state or no quote
  if (quoteError || !currentQuote) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Parts Selection Issue</AlertTitle>
            <AlertDescription>
              {quoteError || 'No EzyParts data was received. This usually happens when:'}
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>No parts were selected in EzyParts</li>
                <li>The "Send to WMS" button wasn't clicked</li>
                <li>There was a connection issue</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">What to do next:</h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Go back and search for your vehicle again</li>
              <li>2. Select the parts you need in EzyParts</li>
              <li>3. Click "Send to WMS" to return the parts to WorkshopBase</li>
            </ol>
          </div>
          
          <Button onClick={handleBackToSearch} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start New Vehicle Search
          </Button>
        </div>
      </div>
    );
  }

  // Display quote and allow adding to inventory
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Parts Selected from EzyParts
          </h1>
          <p className="text-muted-foreground">
            Vehicle: {currentQuote.headers.make} {currentQuote.headers.model}
            {currentQuote.headers.rego && ` (${currentQuote.headers.rego})`}
            {vehicleInfo && !currentQuote.headers.rego && ` (${vehicleInfo})`}
          </p>
        </div>
        
        <Button onClick={handleBackToSearch} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selected Parts ({currentQuote.parts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentQuote.parts.map((part, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{part.partDescription}</h4>
                  <p className="text-sm text-muted-foreground">
                    Brand: {part.brand} | SKU: {part.sku} | Qty: {part.qty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${part.nettPriceEach.toFixed(2)} each</p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${(part.nettPriceEach * part.qty).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Ready to Add to Inventory</h4>
            <p className="text-sm text-blue-700 mb-4">
              These parts will be added to your inventory system where you can invoice them to customers for completed jobs.
            </p>
            
            <Button 
              onClick={handleAddAllPartsToInventory} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding to Inventory...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Add All Parts to Inventory
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EzyPartsSelection;
