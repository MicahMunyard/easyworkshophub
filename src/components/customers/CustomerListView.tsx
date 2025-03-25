
import React from "react";
import { CustomerType } from "@/types/customer";
import CustomerListItem from "@/components/CustomerListItem";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";

interface CustomerListViewProps {
  title: string;
  description: string;
  customers: CustomerType[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  onCustomerClick: (id: string) => void;
}

const CustomerListView: React.FC<CustomerListViewProps> = ({
  title,
  description,
  customers,
  searchTerm,
  setSearchTerm,
  isFilterOpen,
  setIsFilterOpen,
  onCustomerClick
}) => {
  return (
    <Card className="performance-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="h-9"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isFilterOpen && (
          <div className="bg-muted/30 p-4 rounded-md border animate-fadeIn mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search by name, phone, or email..."
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
        )}
        
        <div className="rounded-md border">
          <div className="grid gap-3 p-4">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <CustomerListItem 
                  key={customer.id} 
                  customer={customer} 
                  onClick={onCustomerClick} 
                />
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No customers found</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerListView;
