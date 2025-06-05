
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Clock, 
  Car, 
  Package, 
  FileText, 
  ShoppingBag
} from 'lucide-react';
import { getSavedQuotes } from '@/utils/inventory/ezyPartsIntegration';
import { format } from 'date-fns';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { QuoteResponse } from '@/types/ezyparts';

const EzyPartsHistoryView: React.FC = () => {
  const { inventoryItems } = useInventoryItems();
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load saved quotes from localStorage
    const quotes = getSavedQuotes();
    setSavedQuotes(quotes);
  }, []);

  const handleSelectQuote = (quote: QuoteResponse) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Count how many parts from each quote are currently in inventory
  const getInventoryMatchCount = (quote: QuoteResponse) => {
    if (!quote.parts || !inventoryItems.length) return 0;
    
    const quoteSKUs = quote.parts.map(part => part.sku);
    const matchCount = inventoryItems.filter(item => {
      // Check if item code contains the SKU (our EzyParts integration prefixes SKUs with EP-)
      return quoteSKUs.some(sku => item.code.includes(sku));
    }).length;
    
    return matchCount;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote History
          </CardTitle>
          <CardDescription>
            Previous vehicle quotes from connected suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Quote History</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                You haven't saved any supplier quotes yet. Get quotes from connected suppliers to see them here.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-center">Parts</TableHead>
                    <TableHead className="text-center">In Inventory</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedQuotes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {formatDate(item.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {item.vehicle.make} {item.vehicle.model}
                            </div>
                            {item.vehicle.rego && (
                              <div className="text-xs text-muted-foreground">
                                Rego: {item.vehicle.rego}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quote.parts?.length || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getInventoryMatchCount(item.quote) > 0 ? 'text-green-600 font-medium' : ''}>
                          {getInventoryMatchCount(item.quote)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSelectQuote(item.quote)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t p-4">
          <div className="text-sm text-muted-foreground">
            {savedQuotes.length} saved quote{savedQuotes.length !== 1 ? 's' : ''}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Details
            </DialogTitle>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Vehicle</h3>
                  <p className="mt-1 font-medium">
                    {selectedQuote.headers.make} {selectedQuote.headers.model}
                  </p>
                  {selectedQuote.headers.rego && (
                    <p className="text-sm text-muted-foreground">
                      Registration: {selectedQuote.headers.rego}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p className="mt-1">{selectedQuote.headers.dateServed}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Store</h3>
                  <p className="mt-1">{selectedQuote.headers.locationName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Parts</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuote.parts.map((part, index) => {
                        // Check if this part exists in inventory
                        const inInventory = inventoryItems.some(item => 
                          item.code.includes(part.sku)
                        );
                        
                        return (
                          <TableRow key={index} className={inInventory ? 'bg-green-50' : ''}>
                            <TableCell>
                              <div className="font-medium">
                                {part.partDescription}
                                {inInventory && (
                                  <span className="inline-flex items-center ml-2 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                    <Package className="h-3 w-3 mr-1" />
                                    In Inventory
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {part.sku}
                              </div>
                            </TableCell>
                            <TableCell>{part.brand}</TableCell>
                            <TableCell className="text-center">{part.qty}</TableCell>
                            <TableCell className="text-right">
                              ${part.nettPriceEach.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EzyPartsHistoryView;
