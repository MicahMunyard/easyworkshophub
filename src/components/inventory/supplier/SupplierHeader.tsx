
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupplierHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onTabChange: (value: string) => void;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({ 
  searchTerm, 
  onSearchChange,
  onTabChange
}) => {
  return (
    <div className="flex justify-between items-center gap-4 mb-8">
      <div className="flex items-center gap-8">
        <h2 className="text-2xl font-bold">Suppliers</h2>
        <Tabs defaultValue="manage" className="relative top-[2px]">
          <TabsList>
            <TabsTrigger value="manage" onClick={() => onTabChange('manage')}>
              Manage
            </TabsTrigger>
            <TabsTrigger value="order" onClick={() => onTabChange('order')}>
              Create Order
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative w-[300px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search suppliers..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SupplierHeader;
