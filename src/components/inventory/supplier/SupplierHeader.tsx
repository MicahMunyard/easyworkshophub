
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SupplierHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddSupplier: () => void;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({ 
  searchTerm, 
  onSearchChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Supplier Management</h2>
        <p className="text-muted-foreground">Manage your parts and service suppliers</p>
      </div>

      <div className="relative w-full sm:w-[400px]">
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
