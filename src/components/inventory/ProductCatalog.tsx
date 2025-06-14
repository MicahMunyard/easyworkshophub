
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InventoryItem, Supplier } from '@/types/inventory';
import ProductForm from './ProductForm';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';
import ProductTable from './ProductTable';
import ProductFilters from './ProductFilters';

type ProductCatalogProps = {
  onAddToOrder?: (item: InventoryItem) => void;
};

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToOrder }) => {
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, duplicateInventoryItem } = useInventoryItems();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

  // Calculate the maximum price for the price range slider
  const maxPrice = Math.max(...inventoryItems.map(item => item.price), 100);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  // Update price range when inventory items change or on initial load
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Extract unique categories
  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))];
  
  // Extract unique suppliers
  const uniqueSuppliers = ['all', ...new Set(inventoryItems.map(item => item.supplierId))];

  // Extract unique brands
  const uniqueBrands = [...new Set(inventoryItems.map(item => item.brand).filter(Boolean))].sort();

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || item.supplierId === supplierFilter;
    const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;
    const matchesPriceRange = item.price >= priceRange[0] && item.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesBrand && matchesPriceRange;
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
    deleteInventoryItem(id);
    handleCloseDialog();
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
              <div className="flex items-center text-sm text-muted-foreground">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </div>
            </div>
            
            <ProductFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              supplierFilter={supplierFilter}
              setSupplierFilter={setSupplierFilter}
              brandFilter={brandFilter}
              setBrandFilter={setBrandFilter}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              maxPrice={maxPrice}
              categories={categories}
              uniqueSuppliers={uniqueSuppliers}
              uniqueBrands={uniqueBrands}
              getSupplierName={getSupplierName}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ProductTable 
            items={filteredItems}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteItem}
            onDuplicate={handleDuplicateItem}
            onAddToOrder={onAddToOrder}
            getSupplierName={getSupplierName}
          />
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
            onDelete={handleDeleteItem}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
