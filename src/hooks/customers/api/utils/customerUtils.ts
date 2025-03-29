
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Utility to get the number of bookings for a specific customer
 */
export const getCustomerBookingCount = async (customerId: string, userId?: string): Promise<number> => {
  try {
    if (!userId) return 0;
    
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
      .eq('user_id', userId)
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
