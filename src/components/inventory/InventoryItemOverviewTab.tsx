import React from 'react';
import { InventoryItem } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Droplet, Package2 } from 'lucide-react';
import { formatStockDisplay, formatPricePerUnit } from '@/utils/inventory/unitConversion';

interface InventoryItemOverviewTabProps {
  item: InventoryItem;
}

const InventoryItemOverviewTab: React.FC<InventoryItemOverviewTabProps> = ({ item }) => {
  return (
    <div className="space-y-6">
      {/* Status and Product Type */}
      <div className="flex items-center gap-2">
        <Badge
          variant={
            item.status === 'critical' ? 'destructive' :
            item.status === 'low' ? 'default' :
            'secondary'
          }
        >
          {item.status === 'critical' ? 'Critical Stock' :
           item.status === 'low' ? 'Low Stock' :
           'In Stock'}
        </Badge>
        
        {item.isBulkProduct && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            {item.unitOfMeasure === 'litre' ? <Droplet className="h-3 w-3" /> : <Package2 className="h-3 w-3" />}
            Bulk Product
          </Badge>
        )}
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Product Code</dt>
                <dd className="font-medium">{item.code}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Brand</dt>
                <dd className="font-medium">{item.brand || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd className="font-medium">{item.category}</dd>
              </div>
              {item.location && (
                <div>
                  <dt className="text-sm text-muted-foreground">Location</dt>
                  <dd className="font-medium">{item.location}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Stock Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Current Stock</dt>
                <dd className="font-medium text-lg">
                  {item.isBulkProduct && item.bulkQuantity
                    ? formatStockDisplay(item.inStock, item.bulkQuantity, item.unitOfMeasure)
                    : `${item.inStock} units`
                  }
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Minimum Stock</dt>
                <dd className="font-medium">
                  {item.isBulkProduct && item.bulkQuantity
                    ? formatStockDisplay(item.minStock, item.bulkQuantity, item.unitOfMeasure)
                    : `${item.minStock} units`
                  }
                </dd>
              </div>
              {item.isBulkProduct && item.bulkQuantity && (
                <div>
                  <dt className="text-sm text-muted-foreground">Container Size</dt>
                  <dd className="font-medium">{item.bulkQuantity} {item.unitOfMeasure} per container</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Pricing</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Cost Price</dt>
                <dd className="font-medium">
                  ${item.price.toFixed(2)}
                  {item.isBulkProduct && item.bulkQuantity && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatPricePerUnit(item.price, item.bulkQuantity, item.unitOfMeasure)})
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Retail Price</dt>
                <dd className="font-medium text-green-600">
                  ${(item.retailPrice || item.price).toFixed(2)}
                  {item.isBulkProduct && item.bulkQuantity && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatPricePerUnit(item.retailPrice || item.price, item.bulkQuantity, item.unitOfMeasure)})
                    </span>
                  )}
                </dd>
              </div>
              {item.retailPrice && (
                <div>
                  <dt className="text-sm text-muted-foreground">Margin</dt>
                  <dd className="font-medium text-green-600">
                    {(((item.retailPrice - item.price) / item.price) * 100).toFixed(1)}%
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Supplier</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Supplier ID</dt>
                <dd className="font-medium">{item.supplierId}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {item.description && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryItemOverviewTab;
