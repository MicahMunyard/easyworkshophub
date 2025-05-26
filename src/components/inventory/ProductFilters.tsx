
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, DollarSign } from 'lucide-react';

type ProductFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  supplierFilter: string;
  setSupplierFilter: (value: string) => void;
  brandFilter?: string;
  setBrandFilter?: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  maxPrice: number;
  categories: string[];
  uniqueSuppliers: string[];
  uniqueBrands?: string[];
  getSupplierName: (supplierId: string) => string;
};

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  setCategoryFilter,
  supplierFilter,
  setSupplierFilter,
  brandFilter = 'all',
  setBrandFilter,
  priceRange,
  setPriceRange,
  maxPrice,
  categories,
  uniqueSuppliers,
  uniqueBrands = [],
  getSupplierName,
}) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products by name, code, or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" /> Category
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        {setBrandFilter && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" /> Brand
            </Label>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Supplier Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" /> Supplier
          </Label>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All suppliers" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSuppliers.map(supplierId => (
                <SelectItem key={supplierId} value={supplierId}>
                  {supplierId === 'all' ? 'All Suppliers' : getSupplierName(supplierId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" /> Price Range
          </Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={maxPrice}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
