
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/inventory';
import { ShoppingCart, Truck } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  onStartOrder: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onStartOrder }) => {
  return (
    <Card key={supplier.id} className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-4 w-4" />
          {supplier.name}
        </CardTitle>
        <CardDescription>{supplier.category}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 pt-0">
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">Contact:</span>
            <span>{supplier.contactPerson}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">Email:</span>
            <span className="text-xs">{supplier.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone:</span>
            <span>{supplier.phone}</span>
          </div>
        </div>
      </CardContent>
      
      <div className="mt-auto p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onStartOrder(supplier)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> Create Order
        </Button>
      </div>
    </Card>
  );
};

export default SupplierCard;
