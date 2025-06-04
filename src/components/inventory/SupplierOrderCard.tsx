
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Supplier } from '@/types/inventory';
import { ShoppingCart, Package, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EzyPartsOrderModal from './EzyPartsOrderModal';

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
  const [isEzyPartsModalOpen, setIsEzyPartsModalOpen] = useState(false);

  const handleOrderClick = async () => {
    if (supplier.connectionType === 'api') {
      // Check if this is Burson Auto Parts
      if (supplier.name === 'Burson Auto Parts') {
        // Open the EzyParts Order Modal instead of the auth flow
        setIsEzyPartsModalOpen(true);
      } else {
        onStartApiOrder(supplier);
      }
    } else {
      onStartManualOrder(supplier);
    }
  };

  return (
    <>
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
            {supplier.name === 'Burson Auto Parts' ? 'Order Products' : 
             supplier.connectionType === 'api' ? 'Connect & Order' : 'Create Order'}
          </Button>
        </CardContent>
      </Card>

      {/* EzyParts Order Modal */}
      <EzyPartsOrderModal 
        isOpen={isEzyPartsModalOpen}
        onClose={() => setIsEzyPartsModalOpen(false)}
      />
    </>
  );
};

export default SupplierOrderCard;
