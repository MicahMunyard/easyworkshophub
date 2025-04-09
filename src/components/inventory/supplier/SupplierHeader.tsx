
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface SupplierHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddSupplier: () => void;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onAddSupplier 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">Manage your parts and service suppliers</p>
        </div>
        <Button onClick={onAddSupplier}>
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </Button>
      </div>

      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search suppliers..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SupplierHeader;
