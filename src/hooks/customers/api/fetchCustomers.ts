
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCustomerBookingCount } from "./utils/customerUtils";

export const useFetchCustomers = () => {
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
          
          const bookingCount = await getCustomerBookingCount(customer.id, user.id);
          const totalSpending = await getCustomerTotalSpending(customer.phone);
          
          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || "",
            email: customer.email,
            status: customer.status as "active" | "inactive",
            lastVisit: customer.last_visit,
            totalBookings: bookingCount,
            vehicleInfo: vehicleData?.map(v => v.vehicle_info) || [],
            totalSpending: totalSpending
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

  const getCustomerTotalSpending = async (phone: string): Promise<number> => {
    try {
      if (!phone) return 0;
      
      const { data: bookings, error } = await supabase
        .from('user_bookings')
        .select('cost')
        .eq('user_id', user?.id)
        .eq('customer_phone', phone)
        .not('cost', 'is', null);
      
      if (error) {
        console.error('Error counting total spending:', error);
        return 0;
      }
      
      return bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
    } catch (error) {
      console.error('Error getting total spending:', error);
      return 0;
    }
  };

  return { fetchCustomers };
};
