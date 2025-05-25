
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Car, Package, Trash2 } from 'lucide-react';
import { SavedQuote } from '@/types/ezyparts';

const SavedQuotesList: React.FC = () => {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  useEffect(() => {
    // Load saved quotes from localStorage
    try {
      const stored = localStorage.getItem('ezypartsQuotes');
      if (stored) {
        setSavedQuotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading saved quotes:', error);
    }
  }, []);

  const deleteQuote = (index: number) => {
    const updated = savedQuotes.filter((_, i) => i !== index);
    setSavedQuotes(updated);
    localStorage.setItem('ezypartsQuotes', JSON.stringify(updated));
  };

  if (savedQuotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Saved Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No saved quotes yet. Complete a search in EzyParts to see quotes here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Saved Quotes ({savedQuotes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedQuotes.map((savedQuote, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {savedQuote.vehicle.make} {savedQuote.vehicle.model}
                </span>
                {savedQuote.vehicle.rego && (
                  <Badge variant="outline">{savedQuote.vehicle.rego}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuote(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(savedQuote.timestamp).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {savedQuote.quote.parts?.length || 0} parts
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SavedQuotesList;
