
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomerType } from "@/types/customer";
import CustomerListItem from "@/components/CustomerListItem";
import { Tag, Calendar, Clock } from "lucide-react";
import { TierGate } from "@/components/tier/TierGate";

interface CustomerOverviewProps {
  recentCustomers: CustomerType[];
  handleCustomerClick: (id: string) => void;
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({
  recentCustomers,
  handleCustomerClick
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card className="performance-card lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>
            Showing your most recently added customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCustomers.map((customer) => (
              <CustomerListItem 
                key={customer.id} 
                customer={customer} 
                onClick={handleCustomerClick} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <TierGate 
        featureKey="customer_insights"
        fallback="blur"
        upgradeMessage="Upgrade to Full Access to view customer analytics, engagement metrics, and insights"
      >
        <Card className="performance-card">
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>
              Activity and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Customer Tags</div>
                <div className="text-xs text-muted-foreground">Usage</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs">Regular Customer</span>
                  </div>
                  <span className="text-xs">58%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs">VIP</span>
                  </div>
                  <span className="text-xs">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-xs">New Customer</span>
                  </div>
                  <span className="text-xs">19%</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Communications</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/30 rounded-md p-2">
                  <div className="text-lg font-bold">24</div>
                  <div className="text-xs text-muted-foreground">Calls</div>
                </div>
                <div className="bg-muted/30 rounded-md p-2">
                  <div className="text-lg font-bold">48</div>
                  <div className="text-xs text-muted-foreground">Emails</div>
                </div>
                <div className="bg-muted/30 rounded-md p-2">
                  <div className="text-lg font-bold">36</div>
                  <div className="text-xs text-muted-foreground">SMS</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Upcoming Reminders</div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">12 due this week</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">35 due this month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TierGate>
    </div>
  );
};

export default CustomerOverview;
