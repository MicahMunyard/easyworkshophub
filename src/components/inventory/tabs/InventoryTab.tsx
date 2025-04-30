
import React from 'react';
import ProductCatalog from '@/components/inventory/ProductCatalog';
import EzyPartsHistoryView from '@/components/inventory/EzyPartsHistoryView';

const InventoryTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <ProductCatalog />
      <EzyPartsHistoryView />
    </div>
  );
};

export default InventoryTab;
