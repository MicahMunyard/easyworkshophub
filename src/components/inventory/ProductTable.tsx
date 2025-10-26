
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { InventoryItem } from '@/types/inventory';
import { Barcode, Copy, Edit, ShoppingCart, Tag } from 'lucide-react';
import { getCategoryIcon, getCategoryColor, getCategoryById } from './config/productCategories';
import { useUserCategories } from '@/hooks/inventory/useUserCategories';

interface ProductTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string, name: string) => void;
  onDuplicate: (item: InventoryItem) => void;
  onAddToOrder?: (item: InventoryItem) => void;
  getSupplierName: (supplierId: string) => string;
}

const ProductTable: React.FC<ProductTableProps> = ({
  items,
  onEdit,
  onDelete,
  onDuplicate,
  onAddToOrder,
  getSupplierName
}) => {
  const { userCategories } = useUserCategories();

  const getCategoryInfo = (categoryId: string) => {
    // First check user categories
    const userCategory = userCategories.find(cat => cat.id === categoryId);
    if (userCategory) {
      return {
        icon: userCategory.icon,
        color: userCategory.color,
        name: userCategory.name
      };
    }

    // Fall back to default categories
    const defaultCategory = getCategoryById(categoryId);
    if (defaultCategory) {
      return {
        icon: defaultCategory.icon,
        color: defaultCategory.color,
        name: defaultCategory.name
      };
    }

    // Ultimate fallback
    return {
      icon: getCategoryIcon(categoryId),
      color: getCategoryColor(categoryId),
      name: categoryId
    };
  };

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="hidden md:table-cell">Supplier</TableHead>
          <TableHead>Cost Price</TableHead>
          <TableHead>Retail Price</TableHead>
          <TableHead className="hidden lg:table-cell">Stock</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
        <TableBody>
          {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              No products found. Add your first product to get started.
            </TableCell>
          </TableRow>
          ) : (
            items.map((item) => {
              const stockPercentage = (item.inStock / Math.max(item.minStock, 1)) * 100;
              const categoryInfo = getCategoryInfo(item.category);
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${categoryInfo.color}20`, border: `1px solid ${categoryInfo.color}40` }}
                      >
                        <CategoryIcon 
                          className="h-5 w-5" 
                          style={{ color: categoryInfo.color }} 
                        />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">
                          {categoryInfo.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{item.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{item.brand || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getSupplierName(item.supplierId)}
                  </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              ${item.price.toFixed(2)}
            </TableCell>
            <TableCell className="font-medium text-green-600">
              ${(item.retailPrice || item.price).toFixed(2)}
            </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.inStock} in stock</span>
                        <span className={cn(
                          item.status === "critical" ? "text-destructive" :
                          item.status === "low" ? "text-amber-500" : "text-muted-foreground"
                        )}>
                          Min: {item.minStock}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(stockPercentage, 100)} 
                        className={cn(
                          "h-2",
                          item.status === "critical" ? "text-destructive" :
                          item.status === "low" ? "text-amber-500" : ""
                        )} 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onAddToOrder && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => onAddToOrder(item)}
                          title="Add to order"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onDuplicate(item)}
                        title="Duplicate product"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onEdit(item)}
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default ProductTable;
