
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import CustomerNotes from "@/components/customer-notes";

interface CustomerNotesTabProps {
  customerId: string;
}

const CustomerNotesTab: React.FC<CustomerNotesTabProps> = ({ customerId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Notes</CardTitle>
        <CardDescription>Internal notes about this customer</CardDescription>
      </CardHeader>
      <CardContent>
        <CustomerNotes customerId={customerId} />
      </CardContent>
    </Card>
  );
};

export default CustomerNotesTab;
