
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CustomerType } from "@/types/customer";
import { getCustomerBookingCount } from "./utils/customerUtils";

export const useFindCustomer = () => {
  const { user } = useAuth();

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
          totalBookings: await getCustomerBookingCount(matchingCustomer.id, user.id),
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
