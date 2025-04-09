
import React, { useState, useEffect } from "react";
import AddBrakeCleanerProduct from "@/components/inventory/AddBrakeCleanerProduct";
import InventoryPageHeader from "@/components/inventory/InventoryPageHeader";
import InventoryTabs from "@/components/inventory/InventoryTabs";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";

const Inventory = () => {
  const { suppliers } = useSuppliers();
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [productAdded, setProductAdded] = useState(false);

  // This effect will run once when the component mounts
  useEffect(() => {
    if (!productAdded) {
      setProductAdded(true);
    }
  }, [productAdded]);

  const handleStartOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsOrderMode(true);
  };

  const handleBackToSuppliers = () => {
    setIsOrderMode(false);
    setSelectedSupplier(null);
  };

  const handleOrderComplete = () => {
    setIsOrderMode(false);
    setSelectedSupplier(null);
    setActiveTab("orders");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {!productAdded && <AddBrakeCleanerProduct />}
      
      <InventoryPageHeader />

      <InventoryTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOrderMode={isOrderMode}
        selectedSupplier={selectedSupplier}
        onStartOrder={handleStartOrder}
        onBackToSuppliers={handleBackToSuppliers}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};

export default Inventory;
