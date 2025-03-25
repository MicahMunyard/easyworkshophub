
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CustomerStatsProps {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
}

const CustomerStats: React.FC<CustomerStatsProps> = ({
  totalCustomers,
  activeCustomers,
  inactiveCustomers,
  newCustomersThisMonth
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="performance-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            +{Math.round((newCustomersThisMonth/totalCustomers) * 100)}% from last month
          </p>
          <Progress value={70} className="mt-3 h-2" indicatorClassName="bg-workshop-red" />
        </CardContent>
      </Card>
      
      <Card className="performance-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
          <p className="text-xs text-muted-foreground">
            +5% from last month
          </p>
          <Progress value={85} className="mt-3 h-2" indicatorClassName="bg-workshop-blue" />
        </CardContent>
      </Card>
      
      <Card className="performance-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inactive Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveCustomers}</div>
          <p className="text-xs text-muted-foreground">
            -3% from last month
          </p>
          <Progress value={25} className="mt-3 h-2" indicatorClassName="bg-workshop-red" />
        </CardContent>
      </Card>
      
      <Card className="performance-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newCustomersThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            +18% from last month
          </p>
          <Progress value={45} className="mt-3 h-2" indicatorClassName="bg-workshop-orange" />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStats;
