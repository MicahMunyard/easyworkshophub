
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CustomerType, CustomerDetailType } from "@/types/customer";
import { BookingType } from "@/types/booking";
import { useCustomerAPI } from "./useCustomerAPI";

export const useCustomerActions = (
  customers: CustomerType[],
  setCustomers: React.Dispatch<React.SetStateAction<CustomerType[]>>,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<CustomerDetailType | null>>,
  setIsCustomerDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedCustomerForDetail: React.Dispatch<React.SetStateAction<CustomerType | null>>,
  setIsNewCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setIsDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const { getBookingHistoryForCustomer, deleteAllCustomers } = useCustomerAPI();

  const handleCustomerClick = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    const bookingHistory = getBookingHistoryForCustomer(id);
    
    const detailedCustomer: CustomerDetailType = {
      ...customer,
      bookingHistory
    };
    
    setSelectedCustomer(detailedCustomer);
    setIsCustomerDetailsOpen(true);
  };

  const handleCustomerSelect = (customer: CustomerType) => {
    setSelectedCustomerForDetail(customer);
    
    const bookingHistory = getBookingHistoryForCustomer(customer.id);
    
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

  const handleAddCustomer = (newCustomerData: { 
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

  const handleDeleteAllCustomers = async () => {
    const success = await deleteAllCustomers();
    if (success) {
      setCustomers([]);
      setIsDeleteConfirmOpen(false);
    }
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

  return {
    handleCustomerClick,
    handleCustomerSelect,
    closeCustomerDetails,
    handleAddCustomer,
    handleDeleteAllCustomers,
    addCustomerFromBooking
  };
};
