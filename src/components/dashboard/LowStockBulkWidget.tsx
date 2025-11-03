import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ArrowRight, Droplet, Package2 } from 'lucide-react';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useNavigate } from 'react-router-dom';
import { formatStockDisplay } from '@/utils/inventory/unitConversion';
import { Skeleton } from '@/components/ui/skeleton';

const LowStockBulkWidget: React.FC = () => {
  const { inventoryItems, isLoading } = useInventoryItems();
  const navigate = useNavigate();

  const lowStockBulkProducts = React.useMemo(() => {
    return inventoryItems
      .filter(item => item.isBulkProduct && item.inStock < item.minStock)
      .sort((a, b) => {
        // Sort by severity: critical first, then low
        const aPercentage = (a.inStock / a.minStock) * 100;
        const bPercentage = (b.inStock / b.minStock) * 100;
        return aPercentage - bPercentage;
      })
      .slice(0, 5); // Show top 5 most critical
  }, [inventoryItems]);

  const getStockPercentage = (inStock: number, minStock: number) => {
    return Math.min((inStock / minStock) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card className="border-amber-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 hover:border-amber-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock: Bulk Products
            {lowStockBulkProducts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {lowStockBulkProducts.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {lowStockBulkProducts.length === 0 ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <Package2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">All bulk products are well stocked ✓</p>
            <p className="text-xs text-muted-foreground mt-1">No items below minimum stock levels</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockBulkProducts.map((item) => {
              const stockPercentage = getStockPercentage(item.inStock, item.minStock);
              const isCritical = stockPercentage < 50;

              return (
                <div key={item.id} className="space-y-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.unitOfMeasure === 'litre' ? (
                          <Droplet className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Package2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Current: </span>
                          <span className={`font-medium ${isCritical ? 'text-destructive' : 'text-amber-600'}`}>
                            {item.bulkQuantity
                              ? formatStockDisplay(item.inStock, item.bulkQuantity, item.unitOfMeasure)
                              : `${item.inStock} units`
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Min: </span>
                          <span className="font-medium">
                            {item.bulkQuantity
                              ? formatStockDisplay(item.minStock, item.bulkQuantity, item.unitOfMeasure)
                              : `${item.minStock} units`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() => navigate('/inventory?tab=suppliers')}
                    >
                      Reorder
                    </Button>
                  </div>
                  <Progress
                    value={stockPercentage}
                    className={`h-2 ${isCritical ? '[&>div]:bg-destructive' : '[&>div]:bg-amber-500'}`}
                  />
                </div>
              );
            })}

            {lowStockBulkProducts.length >= 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/inventory')}
              >
                View All Inventory
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {lowStockBulkProducts.length > 0 && lowStockBulkProducts.length < 5 && (
          <Button
            variant="link"
            size="sm"
            className="w-full mt-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/inventory')}
          >
            View All Inventory →
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockBulkWidget;
