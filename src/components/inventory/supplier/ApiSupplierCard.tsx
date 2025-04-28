
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/inventory';
import { Link, Loader2 } from 'lucide-react';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { useToast } from '@/hooks/use-toast';

interface ApiSupplierCardProps {
  supplier: Supplier;
}

const ApiSupplierCard: React.FC<ApiSupplierCardProps> = ({ supplier }) => {
  const { credentials, isProduction } = useEzyParts();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (supplier.apiConfig?.type === 'bursons') {
      setIsConnecting(true);
      
      if (!credentials.accountId || !credentials.username || !credentials.password) {
        console.log('Missing EzyParts credentials:', {
          accountId: !!credentials.accountId,
          username: !!credentials.username,
          password: !!credentials.password
        });
        
        toast({
          title: 'Configuration Required',
          description: 'Missing OAuth credentials in Supabase secrets. Please check your configuration.',
          variant: 'destructive'
        });
        setIsConnecting(false);
        return;
      }

      try {
        // Get environment-appropriate URL base
        const baseUrl = isProduction ? 
          'https://ezyparts.burson.com.au/burson/auth' : 
          'https://ezypartsqa.burson.com.au/burson/auth';
        
        // Current origin for return URL
        const origin = window.location.origin;
        const returnUrl = `${origin}/ezyparts/quote`;
        const quoteUrl = `${origin}/api/ezyparts-quote`;
        
        // Open a popup window for EzyParts
        const ezyPartsWindow = window.open('', 'ezyPartsWindow', 'width=1024,height=768');
        if (!ezyPartsWindow) {
          toast({
            title: 'Popup Blocked',
            description: 'Please allow popups for this site to connect to EzyParts.',
            variant: 'destructive'
          });
          setIsConnecting(false);
          return;
        }
        
        // Create a form to submit directly to EzyParts authentication endpoint
        const ezyPartsForm = document.createElement('form');
        ezyPartsForm.method = 'POST';
        ezyPartsForm.action = baseUrl;
        ezyPartsForm.target = 'ezyPartsWindow'; // Target the popup window

        // Add required fields
        const fields = {
          accountId: credentials.accountId,
          username: credentials.username,
          password: credentials.password,
          quoteUrl: quoteUrl,
          returnUrl: returnUrl,
          userAgent: 'Mozilla/5.0'
        };

        // Add all fields to the form
        Object.entries(fields).forEach(([name, value]) => {
          if (value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value.toString();
            ezyPartsForm.appendChild(input);
          }
        });

        // Add the form to the body, submit it
        document.body.appendChild(ezyPartsForm);
        ezyPartsForm.submit();
        
        // Remove the form after submission
        setTimeout(() => {
          document.body.removeChild(ezyPartsForm);
          setIsConnecting(false);
        }, 100);
        
        console.log('Submitting form to EzyParts with credentials:', 
          { accountId: credentials.accountId ? 'set' : 'not set' });
        
        // Show a toast to inform the user
        toast({
          title: 'Connecting to EzyParts',
          description: 'EzyParts will open in a new window. Please check your browser if it doesn\'t appear.'
        });
        
      } catch (error) {
        console.error('Failed to connect to EzyParts:', error);
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect to EzyParts. Please check your configuration.',
          variant: 'destructive'
        });
        setIsConnecting(false);
      }
    }
  };

  return (
    <Card className="flex flex-col">
      <CardContent className="p-4">
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
              <h3 className="font-medium">{supplier.name}</h3>
              <p className="text-sm text-muted-foreground">{supplier.category}</p>
            </div>
          </div>
          <Button 
            variant={supplier.apiConfig?.isConnected ? "outline" : "default"}
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                {supplier.apiConfig?.isConnected ? 'Connected' : 'Connect'}
              </>
            )}
          </Button>
        </div>
        
        <div className="text-sm space-y-2 mt-4">
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
