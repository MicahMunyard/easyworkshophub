
import React from 'react';
import { ShoppingCart } from 'lucide-react';

const EmptyOrdersList: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No Orders Yet</h3>
      <p className="text-muted-foreground max-w-md mt-2">
        You haven't placed any orders yet. Create a new order from the suppliers page.
      </p>
    </div>
  );
};

export default EmptyOrdersList;
