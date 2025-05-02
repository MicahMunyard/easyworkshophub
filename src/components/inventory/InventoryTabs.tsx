
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageOpen, Truck, FileText } from 'lucide-react';
import InventoryTab from './tabs/InventoryTab';
import OrdersTab from './tabs/OrdersTab';
import SuppliersTab from './tabs/SuppliersTab';
import { Supplier } from '@/types/inventory';

interface InventoryTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOrderMode?: boolean;
  selectedSupplier?: Supplier | null;
  onStartOrder?: (supplier: Supplier) => void;
  onBackToSuppliers?: () => void;
  onOrderComplete?: () => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({
  activeTab,
  setActiveTab,
  isOrderMode = false,
  selectedSupplier = null,
  onStartOrder = () => {},
  onBackToSuppliers = () => {},
  onOrderComplete = () => {}
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="inventory">
          <PackageOpen className="h-4 w-4 mr-2" /> Inventory
        </TabsTrigger>
        <TabsTrigger value="suppliers">
          <Truck className="h-4 w-4 mr-2" /> Suppliers
        </TabsTrigger>
        <TabsTrigger value="orders">
          <FileText className="h-4 w-4 mr-2" /> Orders
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="inventory" className="space-y-4">
        <InventoryTab />
      </TabsContent>
      
      <TabsContent value="suppliers" className="space-y-4">
        <SuppliersTab 
          isOrderMode={isOrderMode}
          selectedSupplier={selectedSupplier}
          onStartOrder={onStartOrder}
          onBack={onBackToSuppliers}
          onOrderComplete={onOrderComplete}
        />
      </TabsContent>
      
      <TabsContent value="orders" className="space-y-4">
        <OrdersTab />
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
