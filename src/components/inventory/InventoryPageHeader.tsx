
import React from 'react';

const InventoryPageHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage parts, supplies, suppliers and orders
        </p>
      </div>
    </div>
  );
};

export default InventoryPageHeader;
