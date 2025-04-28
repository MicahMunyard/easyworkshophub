
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/inventory';
import { Link } from 'lucide-react';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { useToast } from '@/hooks/use-toast';

interface ApiSupplierCardProps {
  supplier: Supplier;
}

const ApiSupplierCard: React.FC<ApiSupplierCardProps> = ({ supplier }) => {
  const { generateEzyPartsUrl, credentials } = useEzyParts();
  const { toast } = useToast();

  const handleConnect = () => {
    if (supplier.apiConfig?.type === 'bursons') {
      if (!credentials.accountId || !credentials.username || !credentials.password) {
        // If credentials aren't set, redirect to config page
        window.location.href = '/ezyparts/config';
        return;
      }

      try {
        // Generate EzyParts URL for direct connection
        const authUrl = generateEzyPartsUrl({
          returnUrl: window.location.origin + '/inventory'
        });
        
        // Create a temporary DOM element to render the form
        const container = document.createElement('div');
        container.innerHTML = authUrl;
        document.body.appendChild(container);
        
        // Find and submit the form
        const form = container.querySelector('form');
        if (form) {
          form.submit();
        } else {
          throw new Error('Failed to generate auth form');
        }
      } catch (error) {
        console.error('Failed to connect to EzyParts:', error);
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect to EzyParts. Please check your configuration.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {supplier.logoUrl && (
              <img 
                src={supplier.logoUrl} 
                alt={supplier.name} 
                className="w-16 h-12 object-contain"
              />
            )}
            <div>
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <CardDescription>{supplier.category}</CardDescription>
            </div>
          </div>
          <Button 
            variant={supplier.apiConfig?.isConnected ? "outline" : "default"}
            onClick={handleConnect}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            {supplier.apiConfig?.isConnected ? 'Connected' : 'Connect'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 pt-0">
        <div className="text-sm space-y-2">
          <p>{supplier.notes}</p>
          {supplier.apiConfig?.isConnected && (
            <p className="text-green-600 font-medium">
              ✓ Integration active
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSupplierCard;
