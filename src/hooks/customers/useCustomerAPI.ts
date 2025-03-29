
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings: number;
}

export const useCustomerAPI = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Find a customer by email or phone
   */
  const findCustomerByEmailOrPhone = async (email: string, phone: string): Promise<CustomerData | null> => {
    if ((!email || email.trim() === '') && (!phone || phone.trim() === '')) {
      return null;
    }
    
    try {
      setLoading(true);
      
      // Build the query condition based on available data
      let queryCondition = '';
      
      if (email && email.trim() !== '' && phone && phone.trim() !== '') {
        queryCondition = `email.eq.${email},phone.eq.${phone}`;
      } else if (email && email.trim() !== '') {
        queryCondition = `email.eq.${email}`;
      } else if (phone && phone.trim() !== '') {
        queryCondition = `phone.eq.${phone}`;
      }
      
      const { data, error } = await supabase
        .from('user_customers')
        .select('*')
        .or(queryCondition)
        .limit(1);
      
      if (error) {
        console.error('Error finding customer:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      const customer = data[0];
      
      // Count the bookings for this customer
      const { count, error: countError } = await supabase
        .from('user_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_name', customer.name)
        .eq('customer_phone', customer.phone);
      
      if (countError) {
        console.error('Error counting bookings:', countError);
      }
      
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalBookings: count || 0
      };
    } catch (error) {
      console.error('Error in findCustomerByEmailOrPhone:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    findCustomerByEmailOrPhone
  };
};
