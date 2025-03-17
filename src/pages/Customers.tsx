
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Customers = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold">Customers</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            View and manage customer information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Customer list and details will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
