
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Trash2, AlertCircle } from 'lucide-react';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { SavedQuote } from '@/types/ezyparts';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SavedQuotesListProps {
  onViewQuote?: (quote: SavedQuote) => void;
}

export const SavedQuotesList: React.FC<SavedQuotesListProps> = ({ onViewQuote }) => {
  const { savedQuotes, getSavedQuotes, clearSavedQuote, isLoading } = useEzyParts();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Refresh the quotes list when the component mounts
  React.useEffect(() => {
    const loadQuotes = async () => {
      setIsRefreshing(true);
      await getSavedQuotes();
      setIsRefreshing(false);
    };
    
    loadQuotes();
  }, [getSavedQuotes]);
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'dd MMM yyyy, h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle quote deletion
  const handleDeleteQuote = async (timestamp: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this saved quote?')) {
      await clearSavedQuote(timestamp);
    }
  };
  
  // Handle quote viewing
  const handleViewQuote = (quote: SavedQuote) => {
    if (onViewQuote) {
      onViewQuote(quote);
    }
  };
  
  // Display a message if there are no saved quotes
  if (savedQuotes.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Saved Quotes</AlertTitle>
        <AlertDescription>
          You haven't saved any quotes yet. Complete a vehicle search and save quotes to view them here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Quotes</CardTitle>
        <CardDescription>View your previously saved vehicle quotes</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {savedQuotes.map((savedQuote, index) => (
              <Card 
                key={`${savedQuote.timestamp}-${index}`} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewQuote(savedQuote)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {savedQuote.vehicle.make} {savedQuote.vehicle.model}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatTimestamp(savedQuote.timestamp)}
                      </CardDescription>
                    </div>
                    
                    {savedQuote.vehicle.rego && (
                      <Badge variant="outline">{savedQuote.vehicle.rego}</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardFooter className="p-4 pt-2 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {savedQuote.quote.parts?.length || 0} parts
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuote(savedQuote);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => handleDeleteQuote(savedQuote.timestamp, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={() => getSavedQuotes()} 
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Quotes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SavedQuotesList;
