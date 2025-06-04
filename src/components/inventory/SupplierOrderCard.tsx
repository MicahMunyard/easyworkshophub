
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Supplier } from '@/types/inventory';
import { ShoppingCart, Package, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access EzyParts.",
            variant: "destructive"
          });
          return;
        }

        try {
          // Use the same EzyParts search function as the dashboard
          const { data, error } = await supabase.functions.invoke('ezyparts-search', {
            body: {
              user_id: user.id,
              search_params: {} // Empty params will show the general search interface
            }
          });

          if (error) throw error;

          if (data.redirect_url) {
            // Handle data URL by converting to blob and opening
            if (data.redirect_url.startsWith('data:text/html;base64,')) {
              // Decode the base64 HTML
              const base64Data = data.redirect_url.split(',')[1];
              const htmlContent = atob(base64Data);
              
              // Create a blob and open it
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const blobUrl = URL.createObjectURL(blob);
              
              // Open the blob URL in a new window
              const newWindow = window.open(blobUrl, '_blank', 'width=1200,height=800');
              
              // Clean up the blob URL after a short delay
              setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
              }, 1000);
              
              if (newWindow) {
                toast({
                  title: "EzyParts Opened",
                  description: "Search for parts and click 'Send to WMS' to add them to your inventory.",
                });
              } else {
                throw new Error('Popup blocked. Please allow popups for this site.');
              }
            } else {
              // Regular URL - open directly
              window.open(data.redirect_url, '_blank', 'width=1200,height=800');
              
              toast({
                title: "EzyParts Opened",
                description: "Search for parts and click 'Send to WMS' to add them to your inventory.",
              });
            }
          } else {
            throw new Error(data.error || 'Failed to generate EzyParts URL');
          }
        } catch (error) {
          console.error('Error initiating EzyParts auth:', error);
          toast({
            title: "Connection Error",
            description: error instanceof Error ? error.message : "Failed to initiate EzyParts connection. Please try again.",
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
            <span className="truncate">{supplier.email}</span>
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
