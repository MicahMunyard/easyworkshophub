
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Layers } from 'lucide-react';
import type { QuoteResponse } from '@/types/ezyparts';

interface CurrentQuoteCardProps {
  quote: QuoteResponse | null;
  onClearQuote: () => void;
}

export const CurrentQuoteCard: React.FC<CurrentQuoteCardProps> = ({ quote, onClearQuote }) => {
  const navigate = useNavigate();
  
  return (
    <Card className={!quote ? 'opacity-70' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Current Quote
        </CardTitle>
        <CardDescription>
          {quote 
            ? `${quote.headers.make} ${quote.headers.model}${quote.headers.rego ? ` (${quote.headers.rego})` : ''}`
            : 'No active quote'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {quote ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Parts:</span>
              <span className="text-sm">{quote.parts.length} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Quote Date:</span>
              <span className="text-sm">{quote.headers.dateServed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Store:</span>
              <span className="text-sm">{quote.headers.locationName}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm">No active quote. Search for a vehicle to get started.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={() => navigate('/ezyparts/quote')}
          disabled={!quote}
        >
          <Layers className="mr-2 h-4 w-4" />
          View Quote
        </Button>
        
        {quote && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onClearQuote}
          >
            Clear Quote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
