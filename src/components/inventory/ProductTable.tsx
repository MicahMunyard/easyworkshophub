
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { InventoryItem } from '@/types/inventory';
import { Barcode, Copy, Edit, Package, ShoppingCart, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Supplier</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No products found. Add your first product to get started.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const stockPercentage = (item.inStock / Math.max(item.minStock, 1)) * 100;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">
                          {item.category}
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
                  <TableCell className="hidden md:table-cell">
                    {getSupplierName(item.supplierId)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${item.price.toFixed(2)}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(item.id, item.name)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
