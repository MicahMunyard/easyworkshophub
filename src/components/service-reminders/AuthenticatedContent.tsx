
import React from "react";
import ServiceRemindersContent from "./ServiceRemindersContent";
import { ServiceRemindersProps } from "./types";

const AuthenticatedContent: React.FC<ServiceRemindersProps> = ({ 
  customerId, 
  customerVehicles
}) => {
  return (
    <div className="space-y-4">
      <ServiceRemindersContent 
        customerId={customerId}
        customerVehicles={customerVehicles}
      />
    </div>
  );
};

export default AuthenticatedContent;
