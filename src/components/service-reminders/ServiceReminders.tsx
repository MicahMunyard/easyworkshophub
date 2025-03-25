
import React from "react";
import { ServiceRemindersProps } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedContent from "./AuthenticatedContent";
import UnauthenticatedContent from "./UnauthenticatedContent";

const ServiceReminders: React.FC<ServiceRemindersProps> = ({ 
  customerId, 
  customerVehicles = [] 
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Service Reminders</h3>
      </div>
      
      {user ? (
        <AuthenticatedContent 
          customerId={customerId}
          customerVehicles={customerVehicles}
        />
      ) : (
        <UnauthenticatedContent />
      )}
    </div>
  );
};

export default ServiceReminders;
