
import React from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { CustomerDetailType } from "@/types/customer";
import { useCustomerTabs } from "./useCustomerTabs";
import CustomerHeader from "./CustomerHeader";
import CustomerOverviewTab from "./CustomerOverviewTab";
import CustomerNotesTab from "./CustomerNotesTab";
import CustomerCommunicationTab from "./CustomerCommunicationTab";
import CustomerRemindersTab from "./CustomerRemindersTab";
import CustomerHistoryTab from "./CustomerHistoryTab";

interface CustomerDetailsProps {
  customer: CustomerDetailType | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  const { activeTab, setActiveTab } = useCustomerTabs();

  if (!customer) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Select a customer to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomerHeader customer={customer} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reminders">Service Reminders</TabsTrigger>
          <TabsTrigger value="history">Booking History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <CustomerOverviewTab customer={customer} />
        </TabsContent>
        
        <TabsContent value="notes">
          <CustomerNotesTab customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="communication">
          <CustomerCommunicationTab customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="reminders">
          <CustomerRemindersTab customerId={customer.id} customerVehicles={customer.vehicleInfo} />
        </TabsContent>
        
        <TabsContent value="history">
          <CustomerHistoryTab customer={customer} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
