
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CustomerType } from "@/types/customer";

export const useFindCustomer = () => {
  const { user } = useAuth();

  const getCustomerBookingCount = async (customerId: string): Promise<number> => {
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('user_customers')
        .select('phone')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customerData) {
        console.error('Error getting customer phone:', customerError);
        return 0;
      }
      
      const { count, error } = await supabase
        .from('user_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('customer_phone', customerData.phone);
      
      if (error) {
        console.error('Error counting bookings:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting booking count:', error);
      return 0;
    }
  };

  const findCustomerByEmailOrPhone = async (email: string, phone: string): Promise<CustomerType | null> => {
    try {
      if (!user) return null;
      if (!email && !phone) return null;
      
      let query = supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user.id);
      
      if (email) {
        query = query.eq('email', email);
      } else if (phone) {
        query = query.eq('phone', phone);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error finding customer:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        // Return the first matching customer
        const matchingCustomer = data[0];
        
        // Get vehicle info for the customer
        const { data: vehicleData } = await supabase
          .from('user_customer_vehicles')
          .select('vehicle_info')
          .eq('customer_id', matchingCustomer.id);
        
        return {
          id: matchingCustomer.id,
          name: matchingCustomer.name,
          phone: matchingCustomer.phone || "",
          email: matchingCustomer.email,
          status: matchingCustomer.status as "active" | "inactive",
          lastVisit: matchingCustomer.last_visit,
          totalBookings: await getCustomerBookingCount(matchingCustomer.id),
          vehicleInfo: vehicleData?.map(v => v.vehicle_info) || []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding customer by email/phone:', error);
      return null;
    }
  };

  return { findCustomerByEmailOrPhone };
};
