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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CustomerType, CustomerDetailType } from "@/types/customer";
import { BookingType } from "@/types/booking";
import CustomerListItem from "@/components/CustomerListItem";
import CustomerDetailsModal from "@/components/CustomerDetailsModal";
import CustomerDetails from "@/components/CustomerDetails";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  UserPlus, 
  Tag,
  Clock,
  CalendarClock,
  Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

const convertBookingToCustomer = (booking: BookingType): CustomerType => {
  return {
    id: booking.id + 1000,
    name: booking.customer,
    phone: booking.phone,
    status: "active" as const,
    totalBookings: 1,
    vehicleInfo: [booking.car],
    lastVisit: format(new Date(), 'yyyy-MM-dd')
  };
};

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailType | null>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<CustomerType | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleInfo: [""]
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      
      const { data: customerData, error } = await supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      const customersWithVehicles = await Promise.all(
        (customerData || []).map(async (customer) => {
          const { data: vehicleData } = await supabase
            .from('user_customer_vehicles')
            .select('vehicle_info')
            .eq('customer_id', customer.id);
          
          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || "",
            email: customer.email,
            status: customer.status as "active" | "inactive",
            lastVisit: customer.last_visit,
            totalBookings: 0,
            vehicleInfo: vehicleData?.map(v => v.vehicle_info) || []
          } as CustomerType;
        })
      );
      
      setCustomers(customersWithVehicles);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: "destructive",
        title: "Error fetching customers",
        description: "Could not load customer data"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAllCustomers = async () => {
    try {
      if (!user) return;
      
      for (const customer of customers) {
        await supabase
          .from('user_customer_vehicles')
          .delete()
          .eq('customer_id', customer.id);
      }
      
      const { error } = await supabase
        .from('user_customers')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setCustomers([]);
      
      toast({
        title: "Success",
        description: "All customers have been deleted"
      });
      
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting customers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customers"
      });
    }
  };

  const handleCustomerClick = (id: number) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
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

  const handleCustomerSelect = (customer: CustomerType) => {
    setSelectedCustomerForDetail(customer);
    
    const bookingHistory = dummyBookingHistory
      .filter(booking => booking.customerId === customer.id)
      .map(booking => ({
        id: booking.id,
        date: booking.date,
        service: booking.service,
        vehicle: booking.vehicle,
        cost: booking.cost,
        status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
        mechanic: booking.mechanic
      }));
    
    const detailedCustomer: CustomerDetailType = {
      ...customer,
      bookingHistory
    };
    
    setSelectedCustomer(detailedCustomer);
  };
  
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
  
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
  const newCustomersThisMonth = 12;

  const addCustomerFromBooking = (booking: BookingType) => {
    const existingCustomer = customers.find(c => c.phone === booking.phone);
    
    if (existingCustomer) {
      const updatedCustomers = customers.map(c => {
        if (c.phone === booking.phone) {
          return {
            ...c,
            totalBookings: c.totalBookings + 1,
            lastVisit: format(new Date(), 'yyyy-MM-dd'),
            vehicleInfo: c.vehicleInfo 
              ? [...new Set([...c.vehicleInfo, booking.car])] 
              : [booking.car],
            status: "active" as const
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
    } else {
      const newCustomer = convertBookingToCustomer(booking);
      setCustomers([...customers, newCustomer]);
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Name and phone number are required"
      });
      return;
    }

    const customerToAdd: CustomerType = {
      id: Date.now(),
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      email: newCustomer.email.trim() || undefined,
      status: "active",
      lastVisit: format(new Date(), 'yyyy-MM-dd'),
      totalBookings: 0,
      vehicleInfo: newCustomer.vehicleInfo.filter(v => v.trim() !== "")
    };

    setCustomers([...customers, customerToAdd]);
    
    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      vehicleInfo: [""]
    });
    setIsNewCustomerModalOpen(false);
    
    toast({
      title: "Customer added",
      description: "New customer has been added successfully"
    });
  };

  const handleVehicleChange = (index: number, value: string) => {
    const updatedVehicles = [...newCustomer.vehicleInfo];
    updatedVehicles[index] = value;
    setNewCustomer({...newCustomer, vehicleInfo: updatedVehicles});
  };

  const addVehicleField = () => {
    setNewCustomer({
      ...newCustomer, 
      vehicleInfo: [...newCustomer.vehicleInfo, ""]
    });
  };

  const removeVehicleField = (index: number) => {
    const updatedVehicles = [...newCustomer.vehicleInfo];
    updatedVehicles.splice(index, 1);
    setNewCustomer({...newCustomer, vehicleInfo: updatedVehicles});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:hidden">
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
      </div>
      
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsNewCustomerModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> New Customer
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 mt-6">
          <TabsList className="bg-sidebar-accent text-sidebar-foreground">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="all">All Customers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
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
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">12 due this week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">35 due this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
        </Tabs>
      </div>
      
      <CustomerDetailsModal 
        isOpen={isCustomerDetailsOpen}
        onClose={closeCustomerDetails}
        customer={selectedCustomer}
      />
      
      <Dialog open={isNewCustomerModalOpen} onOpenChange={setIsNewCustomerModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-name" className="text-right">
                Name
              </Label>
              <Input
                id="customer-name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="col-span-3"
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="col-span-3"
                placeholder="Phone number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-email" className="text-right">
                Email
              </Label>
              <Input
                id="customer-email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="col-span-3"
                placeholder="Email address (optional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Vehicles
              </Label>
              <div className="col-span-3 space-y-2">
                {newCustomer.vehicleInfo.map((vehicle, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={vehicle}
                      onChange={(e) => handleVehicleChange(index, e.target.value)}
                      placeholder={`Vehicle ${index + 1}`}
                    />
                    {newCustomer.vehicleInfo.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => removeVehicleField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={addVehicleField}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Vehicle
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete all customers? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllCustomers}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
