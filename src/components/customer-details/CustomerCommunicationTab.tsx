
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import CommunicationLog from "@/components/CommunicationLog";

interface CustomerCommunicationTabProps {
  customerId: string;
}

const CustomerCommunicationTab: React.FC<CustomerCommunicationTabProps> = ({ customerId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
        <CardDescription>Record of all communications with this customer</CardDescription>
      </CardHeader>
      <CardContent>
        <CommunicationLog customerId={customerId} />
      </CardContent>
    </Card>
  );
};

export default CustomerCommunicationTab;
