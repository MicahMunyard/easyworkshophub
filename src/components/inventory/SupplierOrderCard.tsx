
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Supplier } from '@/types/inventory';
import { ShoppingCart, Package, Mail, Phone } from 'lucide-react';
import { EzyPartsClient } from '@/integrations/ezyparts/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface SupplierOrderCardProps {
  supplier: Supplier;
  onStartApiOrder: (supplier: Supplier) => void;
  onStartManualOrder: (supplier: Supplier) => void;
}

const SupplierOrderCard: React.FC<SupplierOrderCardProps> = ({
  supplier,
  onStartApiOrder,
  onStartManualOrder
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleOrderClick = async () => {
    if (supplier.connectionType === 'api') {
      // Check if this is Burson Auto Parts
      if (supplier.name === 'Burson Auto Parts') {
        try {
          // Generate the EzyParts auth URL with form submission
          const authForm = EzyPartsClient.generateEzyPartsUrl({
            accountId: 'your-account-id', // This should come from supplier config
            username: 'your-username', // This should come from supplier config
            password: 'your-password', // This should come from supplier config
            quoteUrl: `${window.location.origin}/ezyparts/callback`,
            returnUrl: `${window.location.origin}/inventory`,
            isProduction: false // Use staging for now
          });

          // Create a new window/tab with the form
          const newWindow = window.open('about:blank', '_blank');
          if (newWindow) {
            newWindow.document.write(authForm);
            newWindow.document.close();
          } else {
            toast({
              title: "Pop-up Blocked",
              description: "Please allow pop-ups for this site to connect to EzyParts.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error initiating EzyParts auth:', error);
          toast({
            title: "Connection Error",
            description: "Failed to initiate EzyParts connection. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        onStartApiOrder(supplier);
      }
    } else {
      onStartManualOrder(supplier);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{supplier.name}</CardTitle>
          <Badge variant={supplier.connectionType === 'api' ? 'default' : 'secondary'}>
            {supplier.connectionType === 'api' ? 'API' : 'Manual'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{supplier.category}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{supplier.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{supplier.phone}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleOrderClick}
          className="w-full"
          variant={supplier.connectionType === 'api' ? 'default' : 'outline'}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {supplier.connectionType === 'api' ? 'Connect & Order' : 'Create Order'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupplierOrderCard;
