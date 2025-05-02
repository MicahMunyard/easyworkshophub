
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EzyPartsProvider } from "@/contexts/EzyPartsContext";
import AddBrakeCleanerProduct from "@/components/inventory/AddBrakeCleanerProduct";
import InventoryPageHeader from "@/components/inventory/InventoryPageHeader";
import InventoryTabs from "@/components/inventory/InventoryTabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [productAdded, setProductAdded] = useState(false);
  const [showEzyPartsSuccess, setShowEzyPartsSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const ezyPartsProducts = searchParams.get('ezyparts_products');
    
    // Set the active tab if provided in URL
    if (tab && ['inventory', 'orders'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Show success message if products were added from EzyParts
    if (ezyPartsProducts === 'added') {
      setShowEzyPartsSuccess(true);
      
      // Remove the parameter from URL after processing
      searchParams.delete('ezyparts_products');
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
      
      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        setShowEzyPartsSuccess(false);
      }, 5000);
    }
  }, [location, navigate]);

  // This effect will run once when the component mounts
  useEffect(() => {
    if (!productAdded) {
      setProductAdded(true);
    }
  }, [productAdded]);

  const handleDismissAlert = () => {
    setShowEzyPartsSuccess(false);
  };

  return (
    <EzyPartsProvider>
      <div className="space-y-6 animate-fadeIn">
        {!productAdded && <AddBrakeCleanerProduct />}
        
        {showEzyPartsSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <FileCheck className="h-4 w-4 text-green-500" />
            <AlertTitle>Products Added Successfully</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Products from EzyParts have been added to your inventory.</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 -mr-2" 
                onClick={handleDismissAlert}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <InventoryPageHeader />

        <InventoryTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </EzyPartsProvider>
  );
};

export default Inventory;
