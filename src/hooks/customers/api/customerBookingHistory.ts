
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCustomerBookingHistory = () => {
  const { user } = useAuth();

  const getBookingHistoryForCustomer = async (customerId: string) => {
    try {
      if (!customerId || isNaN(parseInt(customerId, 10))) {
        console.log("Invalid customer ID for booking history:", customerId);
        return [];
      }
      
      const { data: customerData, error: customerError } = await supabase
        .from('user_customers')
        .select('phone, name')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customerData) {
        console.error('Error getting customer:', customerError);
        return [];
      }
      
      const { data: bookings, error: bookingsError } = await supabase
        .from('user_bookings')
        .select(`
          id, 
          customer_name, 
          service, 
          car, 
          booking_date, 
          status, 
          cost,
          technician_id
        `)
        .eq('user_id', user?.id)
        .eq('customer_phone', customerData.phone)
        .order('booking_date', { ascending: false });
      
      if (bookingsError) {
        console.error('Error fetching booking history:', bookingsError);
        return [];
      }
      
      const formattedBookings = await Promise.all((bookings || []).map(async (booking) => {
        let technicianName = "Unassigned";
        
        if (booking.technician_id) {
          const { data: techData } = await supabase
            .from('user_technicians')
            .select('name')
            .eq('id', booking.technician_id)
            .single();
            
          if (techData) {
            technicianName = techData.name;
          }
        }
        
        let bookingCost = booking.cost || 0;
        
        return {
          id: typeof booking.id === 'string' ? parseInt(booking.id.replace(/-/g, '').substring(0, 8), 16) : booking.id,
          date: booking.booking_date,
          service: booking.service,
          vehicle: booking.car,
          cost: bookingCost,
          status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
          mechanic: technicianName
        };
      }));
      
      return formattedBookings;
    } catch (error) {
      console.error('Error getting booking history:', error);
      return [];
    }
  };

  return { getBookingHistoryForCustomer };
};
