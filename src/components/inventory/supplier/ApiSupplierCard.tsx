
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle, Edit } from 'lucide-react';
import { Supplier } from '@/types/inventory';

interface ApiSupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const ApiSupplierCard: React.FC<ApiSupplierCardProps> = ({
  supplier,
  onEdit,
  onDelete
}) => {
  const isConnected = supplier.apiConfig?.isConnected || false;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {supplier.logoUrl ? (
              <img 
                src={supplier.logoUrl} 
                alt={`${supplier.name} logo`}
                className="w-12 h-12 object-contain rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{supplier.category}</Badge>
                {isConnected && (
                  <Badge 
                    variant="default"
                    className="flex items-center gap-1 bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm">
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Contact:</span>
              <p className="font-medium">{supplier.contactPerson}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium text-sm break-words">{supplier.email}</p>
            </div>
          </div>
        </div>

        {supplier.apiConfig && (
          <div className="text-sm">
            <span className="text-muted-foreground">API Type:</span>
            <p className="font-medium capitalize">{supplier.apiConfig.type}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(supplier)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSupplierCard;
