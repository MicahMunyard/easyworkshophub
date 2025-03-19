import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerType, CustomerDetailType } from "@/types/customer";
import { BookingType } from "@/types/booking";
import CustomerListItem from "@/components/CustomerListItem";
import CustomerDetailsModal from "@/components/CustomerDetailsModal";
import { format } from "date-fns";
import { Search, Filter, X, Plus, UserPlus } from "lucide-react";

// Sample customer data (in a real app, this would come from an API)
const dummyCustomers: CustomerType[] = [
  {
    id: 1,
    name: "John Smith",
    phone: "(555) 123-4567",
    email: "john.smith@example.com",
    status: "active",
    lastVisit: "2023-07-15",
    totalBookings: 5,
    vehicleInfo: ["2018 Toyota Camry", "2020 Honda Civic"]
  },
  {
    id: 2,
    name: "Sara Johnson",
    phone: "(555) 234-5678",
    email: "sarajohnson@example.com",
    status: "active",
    lastVisit: "2023-08-22",
    totalBookings: 3,
    vehicleInfo: ["2020 Honda Civic"]
  },
  {
    id: 3,
    name: "Mike Davis",
    phone: "(555) 345-6789",
    status: "inactive",
    lastVisit: "2022-11-10",
    totalBookings: 1,
    vehicleInfo: ["2019 Ford F-150"]
  },
  {
    id: 4,
    name: "Emma Wilson",
    phone: "(555) 456-7890",
    email: "emma.wilson@example.com",
    status: "active",
    lastVisit: "2023-09-05",
    totalBookings: 7,
    vehicleInfo: ["2021 Tesla Model 3"]
  },
  {
    id: 5,
    name: "Robert Chen",
    phone: "(555) 567-8901",
    status: "active",
    lastVisit: "2023-09-01",
    totalBookings: 2,
    vehicleInfo: ["2017 BMW X5"]
  }
];

// Sample booking history data
const dummyBookingHistory = [
  {
    id: 101,
    customerId: 1,
    date: "2023-07-15",
    service: "Oil Change",
    vehicle: "2018 Toyota Camry",
    cost: 49.99,
    status: "completed",
    mechanic: "Alex Johnson"
  },
  {
    id: 102,
    customerId: 1,
    date: "2023-05-22",
    service: "Brake Inspection",
    vehicle: "2018 Toyota Camry",
    cost: 79.99,
    status: "completed",
    mechanic: "Mike Smith"
  },
  {
    id: 103,
    customerId: 2,
    date: "2023-08-22",
    service: "Tire Rotation",
    vehicle: "2020 Honda Civic",
    cost: 39.99,
    status: "completed",
    mechanic: "Alex Johnson"
  },
  {
    id: 104,
    customerId: 4,
    date: "2023-09-05",
    service: "Full Service",
    vehicle: "2021 Tesla Model 3",
    cost: 199.99,
    status: "completed",
    mechanic: "Sarah Lee"
  }
] as const;

// Conversion from BookingType to CustomerType
const convertBookingToCustomer = (booking: BookingType): CustomerType => {
  return {
    id: booking.id + 1000, // Ensure unique ID (in real app, would be proper unique ID)
    name: booking.customer,
    phone: booking.phone,
    status: "active" as const, // Explicitly type as "active"
    totalBookings: 1,
    vehicleInfo: [booking.car],
    lastVisit: format(new Date(), 'yyyy-MM-dd')
  };
};

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerType[]>(dummyCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailType | null>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  
  const handleCustomerClick = (id: number) => {
    // Find the customer
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    // Get booking history for this customer
    const bookingHistory = dummyBookingHistory
      .filter(booking => booking.customerId === id)
      .map(booking => ({
        id: booking.id,
        date: booking.date,
        service: booking.service,
        vehicle: booking.vehicle,
        cost: booking.cost,
        status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
        mechanic: booking.mechanic
      }));
    
    // Create the detailed customer view
    const detailedCustomer: CustomerDetailType = {
      ...customer,
      bookingHistory
    };
    
    setSelectedCustomer(detailedCustomer);
    setIsCustomerDetailsOpen(true);
  };
  
  const closeCustomerDetails = () => {
    setIsCustomerDetailsOpen(false);
    setSelectedCustomer(null);
  };
  
  // Filter customers based on search term and active filter
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      activeFilter === "all" || 
      customer.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Get statistics for the overview tab
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
  const newCustomersThisMonth = 12; // Placeholder, would be calculated based on real data
  
  // In a real app, this would be part of a useEffect hook that listens for new bookings
  const addCustomerFromBooking = (booking: BookingType) => {
    // Check if customer already exists by phone number
    const existingCustomer = customers.find(c => c.phone === booking.phone);
    
    if (existingCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map(c => {
        if (c.phone === booking.phone) {
          return {
            ...c,
            totalBookings: c.totalBookings + 1,
            lastVisit: format(new Date(), 'yyyy-MM-dd'),
            vehicleInfo: c.vehicleInfo 
              ? [...new Set([...c.vehicleInfo, booking.car])] 
              : [booking.car],
            status: "active" as const  // Use type assertion here
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
    } else {
      // Add new customer
      const newCustomer = convertBookingToCustomer(booking);
      setCustomers([...customers, newCustomer]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button onClick={() => console.log("Add new customer")}>
          <UserPlus className="h-4 w-4 mr-2" /> New Customer
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Showing your most recently added customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers
                  .sort((a, b) => 
                    (b.lastVisit || '').localeCompare(a.lastVisit || ''))
                  .slice(0, 5)
                  .map((customer) => (
                    <CustomerListItem 
                      key={customer.id} 
                      customer={customer} 
                      onClick={handleCustomerClick} 
                    />
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card className="performance-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>
                  Manage and view all customers
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
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <CustomerListItem 
                        key={customer.id} 
                        customer={customer} 
                        onClick={handleCustomerClick} 
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
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card className="performance-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Customers</CardTitle>
                <CardDescription>
                  Customers with recent activity
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
                  {filteredCustomers
                    .filter(c => c.status === "active")
                    .length > 0 ? (
                    filteredCustomers
                      .filter(c => c.status === "active")
                      .map((customer) => (
                        <CustomerListItem 
                          key={customer.id} 
                          customer={customer} 
                          onClick={handleCustomerClick} 
                        />
                      ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No active customers found</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <Card className="performance-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inactive Customers</CardTitle>
                <CardDescription>
                  Customers with no recent activity
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
                  {filteredCustomers
                    .filter(c => c.status === "inactive")
                    .length > 0 ? (
                    filteredCustomers
                      .filter(c => c.status === "inactive")
                      .map((customer) => (
                        <CustomerListItem 
                          key={customer.id} 
                          customer={customer} 
                          onClick={handleCustomerClick} 
                        />
                      ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No inactive customers found</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Customer Details Modal */}
      <CustomerDetailsModal 
        isOpen={isCustomerDetailsOpen}
        onClose={closeCustomerDetails}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default Customers;
