
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a booking from Supabase
 */
export const deleteBookingFromSupabase = async (booking: BookingType, userId: string) => {
  console.log("Deleting booking ID:", booking.id, "Type:", typeof booking.id);
  
  try {
    let deleteResult;
    
    if (typeof booking.id === 'number') {
      // Try multiple approaches if ID is a number
      console.log("Using numeric ID approach for deletion");
      
      // Try to delete using both formats (as string and as is)
      deleteResult = await supabase
        .from('user_bookings')
        .delete()
        .eq('user_id', userId)
        .or(`id.eq.${booking.id},id.eq.${booking.id.toString()}`);
    } else {
      // If it's already a string or other format, use it directly
      console.log("Using direct ID approach for deletion");
      
      deleteResult = await supabase
        .from('user_bookings')
        .delete()
        .eq('user_id', userId)
        .eq('id', String(booking.id)); // Convert to string to be safe
    }
    
    if (deleteResult.error) {
      console.error('Error deleting from user_bookings table:', deleteResult.error);
      
      // Fallback approach - try matching other fields
      console.log("Trying alternative deletion approach by matching other fields");
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
