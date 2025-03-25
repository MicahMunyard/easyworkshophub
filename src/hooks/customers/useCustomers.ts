
import { useState, useEffect } from "react";
import { CustomerType, CustomerDetailType } from "@/types/customer";
import { BookingType } from "@/types/booking";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailType | null>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<CustomerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock booking history data
  const dummyBookingHistory = [
    {
      id: 101,
      customerId: "1",
      date: "2023-07-15",
      service: "Oil Change",
      vehicle: "2018 Toyota Camry",
      cost: 49.99,
      status: "completed" as const,
      mechanic: "Alex Johnson"
    },
    {
      id: 102,
      customerId: "1",
      date: "2023-05-22",
      service: "Brake Inspection",
      vehicle: "2018 Toyota Camry",
      cost: 79.99,
      status: "completed" as const,
      mechanic: "Mike Smith"
    },
    {
      id: 103,
      customerId: "2",
      date: "2023-08-22",
      service: "Tire Rotation",
      vehicle: "2020 Honda Civic",
      cost: 39.99,
      status: "completed" as const,
      mechanic: "Alex Johnson"
    },
    {
      id: 104,
      customerId: "4",
      date: "2023-09-05",
      service: "Full Service",
      vehicle: "2021 Tesla Model 3",
      cost: 199.99,
      status: "completed" as const,
      mechanic: "Sarah Lee"
    }
  ];

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

  const handleCustomerClick = (id: string) => {
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

  const closeCustomerDetails = () => {
    setIsCustomerDetailsOpen(false);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = async (newCustomerData: { 
    name: string; 
    phone: string; 
    email: string; 
    vehicleInfo: string[] 
  }) => {
    if (!newCustomerData.name.trim() || !newCustomerData.phone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Name and phone number are required"
      });
      return;
    }

    const customerToAdd: CustomerType = {
      id: String(Date.now()), // Temporary ID, will be replaced by Supabase
      name: newCustomerData.name.trim(),
      phone: newCustomerData.phone.trim(),
      email: newCustomerData.email.trim() || undefined,
      status: "active",
      lastVisit: format(new Date(), 'yyyy-MM-dd'),
      totalBookings: 0,
      vehicleInfo: newCustomerData.vehicleInfo.filter(v => v.trim() !== "")
    };

    setCustomers([...customers, customerToAdd]);
    
    setIsNewCustomerModalOpen(false);
    
    toast({
      title: "Customer added",
      description: "New customer has been added successfully"
    });
  };

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

  const convertBookingToCustomer = (booking: BookingType): CustomerType => {
    return {
      id: String(booking.id + 1000),
      name: booking.customer,
      phone: booking.phone,
      status: "active" as const,
      totalBookings: 1,
      vehicleInfo: [booking.car],
      lastVisit: format(new Date(), 'yyyy-MM-dd')
    };
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

  // Stats calculations
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
  const newCustomersThisMonth = 12; // Placeholder value

  return {
    customers,
    filteredCustomers,
    selectedCustomer,
    isCustomerDetailsOpen,
    isNewCustomerModalOpen,
    isDeleteConfirmOpen,
    searchTerm,
    isFilterOpen,
    activeFilter,
    selectedCustomerForDetail,
    isLoading,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    newCustomersThisMonth,
    setSearchTerm,
    setIsFilterOpen,
    setActiveFilter,
    setIsNewCustomerModalOpen,
    setIsDeleteConfirmOpen,
    fetchCustomers,
    handleDeleteAllCustomers,
    handleCustomerClick,
    handleCustomerSelect,
    closeCustomerDetails,
    handleAddCustomer,
    addCustomerFromBooking
  };
};
