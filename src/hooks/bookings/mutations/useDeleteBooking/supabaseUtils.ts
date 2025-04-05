
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a booking from Supabase
 */
export const deleteBookingFromSupabase = async (booking: BookingType, userId: string) => {
  console.log("Deleting booking ID:", booking.id, "Type:", typeof booking.id);
  
  try {
    // First step: Find the actual booking record in the database
    const { data: foundBookings, error: findError } = await supabase
      .from('user_bookings')
      .select('id')
      .eq('user_id', userId)
      .or(`id.eq.${booking.id},id.eq.${booking.id.toString()}`);
    
    if (findError || !foundBookings || foundBookings.length === 0) {
      console.log("Could not find booking by ID, trying to find by customer details");
      
      // Try to find by customer name and phone
      const { data: altBookings, error: altFindError } = await supabase
        .from('user_bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('customer_name', booking.customer)
        .eq('customer_phone', booking.phone)
        .eq('booking_date', booking.date);
      
      if (altFindError || !altBookings || altBookings.length === 0) {
        console.error("Could not find booking to delete:", altFindError || "No matching booking found");
        throw new Error("Could not find booking to delete");
      }
      
      // Use the ID from the found booking
      const bookingId = altBookings[0].id;
      console.log("Found booking to delete with ID:", bookingId);
      
      // Delete the booking with the correct ID
      const { error: deleteError } = await supabase
        .from('user_bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error("Error deleting booking:", deleteError);
        throw deleteError;
      }
      
      console.log("Successfully deleted booking with ID:", bookingId);
      return { success: true };
    }
    
    // Use the ID from the found booking
    const bookingId = foundBookings[0].id;
    console.log("Found booking to delete with ID:", bookingId);
    
    // Delete the booking with the correct ID
    const { error: deleteError } = await supabase
      .from('user_bookings')
      .delete()
      .eq('id', bookingId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error("Error deleting booking:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully deleted booking with ID:", bookingId);
    return { success: true };
  } catch (error) {
    console.error('Error in deleteBookingFromSupabase:', error);
    throw error;
  }
};
