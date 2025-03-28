
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Package, 
  Barcode,
  ImageIcon,
  Copy
} from 'lucide-react';
import { InventoryItem, Supplier } from '@/types/inventory';
import ProductForm from './ProductForm';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProductCatalogProps = {
  onAddToOrder?: (item: InventoryItem) => void;
};

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToOrder }) => {
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, duplicateInventoryItem } = useInventoryItems();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

  // Extract unique categories
  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))];
  
  // Extract unique suppliers
  const uniqueSuppliers = ['all', ...new Set(inventoryItems.map(item => item.supplierId))];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || item.supplierId === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleOpenDialog = (item?: InventoryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingItem(undefined);
    setIsDialogOpen(false);
  };

  const handleSubmit = (data: Omit<InventoryItem, 'id' | 'status'>) => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, data);
    } else {
      addInventoryItem(data);
    }
    handleCloseDialog();
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product: ${name}?`)) {
      deleteInventoryItem(id);
    }
  };

  const handleDuplicateItem = (item: InventoryItem) => {
    duplicateInventoryItem(item);
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Catalog</h2>
          <p className="text-muted-foreground">Manage your inventory products</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Products</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Category:</span>
                {categories.map(category => (
                  <Badge 
                    key={category} 
                    variant={categoryFilter === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                <span className="text-sm font-medium">Supplier:</span>
                {uniqueSuppliers.map(supplierId => (
                  <Badge 
                    key={supplierId} 
                    variant={supplierFilter === supplierId ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSupplierFilter(supplierId)}
                  >
                    {supplierId === 'all' 
                      ? 'All Suppliers' 
                      : getSupplierName(supplierId)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found. Add your first product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
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
                              onClick={() => handleDuplicateItem(item)}
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
                                <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteItem(item.id, item.name)}>
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${editingItem.name}` : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            item={editingItem} 
            suppliers={suppliers}
            onSubmit={handleSubmit} 
            onCancel={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
