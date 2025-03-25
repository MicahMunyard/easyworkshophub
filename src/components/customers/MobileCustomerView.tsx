
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CustomerType, CustomerDetailType } from "@/types/customer";
import CustomerListItem from "@/components/CustomerListItem";
import CustomerDetails from "@/components/CustomerDetails";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, Search, X } from "lucide-react";

interface MobileCustomerViewProps {
  customers: CustomerType[];
  filteredCustomers: CustomerType[];
  selectedCustomerForDetail: CustomerType | null;
  selectedCustomer: CustomerDetailType | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleCustomerSelect: (customer: CustomerType) => void;
  setIsNewCustomerModalOpen: (isOpen: boolean) => void;
  setIsDeleteConfirmOpen: (isOpen: boolean) => void;
}

const MobileCustomerView: React.FC<MobileCustomerViewProps> = ({
  customers,
  filteredCustomers,
  selectedCustomerForDetail,
  selectedCustomer,
  searchTerm,
  setSearchTerm,
  handleCustomerSelect,
  setIsNewCustomerModalOpen,
  setIsDeleteConfirmOpen
}) => {
  return (
    <Tabs defaultValue="all-customers" className="space-y-4">
      <TabsList className="bg-sidebar-accent text-sidebar-foreground">
        <TabsTrigger value="all-customers">Customers</TabsTrigger>
        <TabsTrigger value="customer-details" disabled={!selectedCustomerForDetail}>
          Details
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all-customers">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsNewCustomerModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> New
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete All
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md border">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search customers..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="rounded-md">
            <div className="grid gap-3">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <CustomerListItem 
                    key={customer.id} 
                    customer={customer} 
                    onClick={() => handleCustomerSelect(customer)} 
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No customers found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="customer-details">
        {selectedCustomer && (
          <CustomerDetails customer={selectedCustomer} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default MobileCustomerView;
