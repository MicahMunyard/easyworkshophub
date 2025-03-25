
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";
import { CustomerBookingHistory } from "./types";

// Mock booking history data
const dummyBookingHistory: CustomerBookingHistory[] = [
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

export const useCustomerAPI = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCustomers = async (): Promise<CustomerType[]> => {
    try {
      if (!user) return [];
      
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
      
      return customersWithVehicles;
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: "destructive",
        title: "Error fetching customers",
        description: "Could not load customer data"
      });
      return [];
    }
  };

  const deleteAllCustomers = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      for (const customer of await fetchCustomers()) {
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
      
      toast({
        title: "Success",
        description: "All customers have been deleted"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting customers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customers"
      });
      return false;
    }
  };

  const getBookingHistoryForCustomer = (customerId: string) => {
    return dummyBookingHistory
      .filter(booking => booking.customerId === customerId)
      .map(booking => ({
        id: booking.id,
        date: booking.date,
        service: booking.service,
        vehicle: booking.vehicle,
        cost: booking.cost,
        status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
        mechanic: booking.mechanic
      }));
  };

  return {
    fetchCustomers,
    deleteAllCustomers,
    getBookingHistoryForCustomer
  };
};
