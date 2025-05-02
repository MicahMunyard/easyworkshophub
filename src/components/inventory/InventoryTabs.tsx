
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageOpen, FileText } from 'lucide-react';
import InventoryTab from './tabs/InventoryTab';
import OrdersTab from './tabs/OrdersTab';

interface InventoryTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({
  activeTab,
  setActiveTab
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="inventory">
          <PackageOpen className="h-4 w-4 mr-2" /> Inventory
        </TabsTrigger>
        <TabsTrigger value="orders">
          <FileText className="h-4 w-4 mr-2" /> Orders
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="inventory" className="space-y-4">
        <InventoryTab />
      </TabsContent>
      
      <TabsContent value="orders" className="space-y-4">
        <OrdersTab />
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
