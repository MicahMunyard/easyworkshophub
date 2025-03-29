
import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  supplierFilter: string;
  setSupplierFilter: (supplierId: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  categories: string[];
  uniqueSuppliers: string[];
  getSupplierName: (supplierId: string) => string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  setCategoryFilter,
  supplierFilter,
  setSupplierFilter,
  priceRange,
  setPriceRange,
  maxPrice,
  categories,
  uniqueSuppliers,
  getSupplierName
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Category:</span>
            {categories.map(category => (
              <Badge 
                key={category} 
                variant={categoryFilter === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(category === categoryFilter ? 'all' : category)}
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
                onClick={() => setSupplierFilter(supplierId === supplierFilter ? 'all' : supplierId)}
              >
                {supplierId === 'all' 
                  ? 'All Suppliers' 
                  : getSupplierName(supplierId)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</span>
          </div>
          <Slider
            defaultValue={[0, maxPrice]}
            value={priceRange}
            min={0}
            max={maxPrice}
            step={1}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
