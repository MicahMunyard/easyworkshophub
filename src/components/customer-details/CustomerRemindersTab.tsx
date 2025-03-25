
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ServiceReminders from "@/components/ServiceReminders";

interface CustomerRemindersTabProps {
  customerId: string;
  customerVehicles: string[] | undefined;
}

const CustomerRemindersTab: React.FC<CustomerRemindersTabProps> = ({ customerId, customerVehicles = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Reminders</CardTitle>
        <CardDescription>Manage upcoming service reminders</CardDescription>
      </CardHeader>
      <CardContent>
        <ServiceReminders customerId={customerId} customerVehicles={customerVehicles} />
      </CardContent>
    </Card>
  );
};

export default CustomerRemindersTab;
