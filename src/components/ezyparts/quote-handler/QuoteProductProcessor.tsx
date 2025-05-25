
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle, 
  ShoppingCart, 
  PackageCheck, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import { PartItem, QuoteResponse } from '@/types/ezyparts';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { addEzyPartsQuoteToInventory, saveQuoteToLocalStorage } from '@/utils/inventory/ezyPartsIntegration';
import { formatCurrency } from './utils';

interface ProductSelectionProps {
  quote: QuoteResponse;
  onComplete: () => void;
  onBack: () => void;
}

const QuoteProductProcessor: React.FC<ProductSelectionProps> = ({
  quote,
  onComplete,
  onBack
}) => {
  const navigate = useNavigate();
  const { addInventoryItem } = useInventoryItems();
  const [selectedParts, setSelectedParts] = useState<{[key: string]: boolean}>({});
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [addedItems, setAddedItems] = useState<string[]>([]);

  // Initialize all parts as selected
  useEffect(() => {
    if (quote && quote.parts) {
      const initialSelection = quote.parts.reduce((acc, part) => {
        acc[part.sku] = true;
        return acc;
      }, {} as {[key: string]: boolean});
      
      setSelectedParts(initialSelection);
    }
  }, [quote]);

  const togglePartSelection = (sku: string) => {
    setSelectedParts(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
  };

  const selectAllParts = () => {
    const allSelected = quote.parts.reduce((acc, part) => {
      acc[part.sku] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setSelectedParts(allSelected);
  };

  const deselectAllParts = () => {
    const allDeselected = quote.parts.reduce((acc, part) => {
      acc[part.sku] = false;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setSelectedParts(allDeselected);
  };

  const getSelectedParts = (): PartItem[] => {
    return quote.parts.filter(part => selectedParts[part.sku]);
  };

  const handleAddToInventory = async () => {
    try {
      setProcessing(true);
      
      // Get selected parts only
      const selectedPartsQuote = {
        ...quote,
        parts: getSelectedParts()
      };
      
      // Save the complete quote for reference
      saveQuoteToLocalStorage(quote);
      
      // Add selected parts to inventory - now properly handling async function
      const addedInventoryItems = await addEzyPartsQuoteToInventory(selectedPartsQuote, addInventoryItem);
      
      // Update UI state
      const partsToAdd = addedInventoryItems.map(item => item.name);
      setAddedItems(partsToAdd);
      setCompleted(true);
      setProcessing(false);
    } catch (error) {
      console.error('Error adding parts to inventory:', error);
      setProcessing(false);
    }
  };

  const handleFinish = () => {
    onComplete();
    // Navigate to inventory tab
    navigate('/inventory?tab=inventory');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {completed ? <PackageCheck className="h-5 w-5 text-green-500" /> : <ShoppingCart className="h-5 w-5" />}
          {completed ? 'Products Added to Inventory' : 'Add Products to Inventory'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {completed ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                {addedItems.length} products have been added to your inventory.
              </AlertDescription>
            </Alert>
            
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addedItems.map((name, index) => (
                    <TableRow key={index}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{quote.parts[index]?.brand || ''}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(quote.parts[index]?.nettPriceEach || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Select the products from EzyParts that you want to add to your inventory.
            </div>
            
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllParts}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllParts}>
                  Deselect All
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {getSelectedParts().length} of {quote.parts.length} selected
              </div>
            </div>
            
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.parts.map((part) => (
                    <TableRow key={part.sku}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedParts[part.sku] || false} 
                          onCheckedChange={() => togglePartSelection(part.sku)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px]" title={part.partDescription}>
                          {part.partDescription}
                        </div>
                        <div className="text-sm text-gray-500">{part.sku}</div>
                      </TableCell>
                      <TableCell>{part.brand}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(part.nettPriceEach)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {completed ? (
          <>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleFinish}>
              View in Inventory
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleAddToInventory} 
              disabled={processing || getSelectedParts().length === 0}
            >
              {processing ? 'Processing...' : 'Add to Inventory'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuoteProductProcessor;
