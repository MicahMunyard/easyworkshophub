
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { CustomerType } from "@/types/customer";
import CustomerListView from "./CustomerListView";
import CustomerStats from "./CustomerStats";
import CustomerOverview from "./CustomerOverview";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CustomerTabContentProps {
  tabValue: string;
  customers: CustomerType[];
  filteredCustomers: CustomerType[];
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  handleCustomerClick: (id: string) => void;
}

const CustomerTabContent: React.FC<CustomerTabContentProps> = ({
  tabValue,
  customers,
  filteredCustomers,
  totalCustomers,
  activeCustomers,
  inactiveCustomers,
  newCustomersThisMonth,
  searchTerm,
  setSearchTerm,
  isFilterOpen,
  setIsFilterOpen,
  handleCustomerClick
}) => {
  const recentCustomers = customers
    .sort((a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || ''))
    .slice(0, 5);

  return (
    <>
      <TabsContent value="overview" className="space-y-4">
        <CustomerStats 
          totalCustomers={totalCustomers}
          activeCustomers={activeCustomers}
          inactiveCustomers={inactiveCustomers}
          newCustomersThisMonth={newCustomersThisMonth}
        />
        
        <CustomerOverview 
          recentCustomers={recentCustomers}
          handleCustomerClick={handleCustomerClick}
        />
      </TabsContent>
      
      <TabsContent value="all" className="space-y-4">
        <CustomerListView
          title="All Customers"
          description="Manage and view all customers"
          customers={filteredCustomers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onCustomerClick={handleCustomerClick}
        />
      </TabsContent>
      
      <TabsContent value="active" className="space-y-4">
        <CustomerListView
          title="Active Customers"
          description="Customers with recent activity"
          customers={filteredCustomers.filter(c => c.status === "active")}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onCustomerClick={handleCustomerClick}
        />
      </TabsContent>
      
      <TabsContent value="inactive" className="space-y-4">
        <CustomerListView
          title="Inactive Customers"
          description="Customers with no recent activity"
          customers={filteredCustomers.filter(c => c.status === "inactive")}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onCustomerClick={handleCustomerClick}
        />
      </TabsContent>
      
      <TabsContent value="tags" className="space-y-4">
        <Card className="performance-card">
          <CardHeader>
            <CardTitle>Customer Tags</CardTitle>
            <CardDescription>
              Manage and organize customers with tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Tag management coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">You can add tags to individual customers in their profile</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reminders" className="space-y-4">
        <Card className="performance-card">
          <CardHeader>
            <CardTitle>Service Reminders</CardTitle>
            <CardDescription>
              Manage upcoming service reminders for all customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Reminder dashboard coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">You can manage reminders for individual customers in their profile</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default CustomerTabContent;
