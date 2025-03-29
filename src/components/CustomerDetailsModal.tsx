
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerDetailType } from "@/types/customer";
import CustomerDetails from "./customer-details";
import { supabase } from "@/integrations/supabase/client";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetailType | null;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  customer 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedCustomer, setEnhancedCustomer] = useState<CustomerDetailType | null>(null);

  useEffect(() => {
    if (customer && isOpen) {
      setEnhancedCustomer(customer);
      loadAdditionalData();
    } else {
      setEnhancedCustomer(null);
    }
  }, [customer, isOpen]);

  const loadAdditionalData = async () => {
    if (!customer) return;
    
    setIsLoading(true);
    
    try {
      // Load any additional data from Supabase that might be needed
      // This function can be expanded as needed to load communication logs, notes, etc.
      console.log("Loading additional data for customer", customer.id);
      
      // For now, we'll just pass through the existing customer data
      setEnhancedCustomer(customer);
    } catch (error) {
      console.error("Error loading additional customer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Complete profile and history for this customer
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Loading customer details...</p>
            </div>
          ) : (
            <CustomerDetails customer={enhancedCustomer} />
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
