
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a booking from Supabase
 */
export const deleteBookingFromSupabase = async (booking: BookingType, userId: string) => {
  console.log("Deleting booking ID:", booking.id, "Type:", typeof booking.id);
  
  try {
    // Delete from user_bookings table using UUID approach
    let deleteResult = await supabase
      .from('user_bookings')
      .delete()
      .eq('user_id', userId)
      .eq('id', String(booking.id)); // Convert to string to be safe
    
    if (deleteResult.error) {
      console.error('Error deleting from user_bookings table:', deleteResult.error);
      // Try alternative deletion by matching other fields
      deleteResult = await supabase
        .from('user_bookings')
        .delete()
        .eq('user_id', userId)
        .eq('customer_name', booking.customer)
        .eq('booking_date', booking.date);
        
      if (deleteResult.error) {
        throw deleteResult.error;
      }
    }
    
    console.log("Delete result:", deleteResult);
    return deleteResult;
  } catch (error) {
    console.error('Error in deleteBookingFromSupabase:', error);
    throw error;
  }
};
