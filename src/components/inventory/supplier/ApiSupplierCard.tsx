
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/inventory';
import { Link } from 'lucide-react';

interface ApiSupplierCardProps {
  supplier: Supplier;
}

const ApiSupplierCard: React.FC<ApiSupplierCardProps> = ({ supplier }) => {
  const handleConnect = () => {
    if (supplier.apiConfig?.type === 'bursons') {
      window.location.href = '/ezyparts/config';
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
