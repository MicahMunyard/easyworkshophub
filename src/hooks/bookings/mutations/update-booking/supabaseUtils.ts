
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Finds the original booking in Supabase by matching criteria
 */
export const findOriginalBookingId = async (booking: BookingType, userId: string): Promise<string> => {
  try {
    const { data: matchingBookings, error: fetchError } = await supabase
      .from('user_bookings')
      .select('id')
      .eq('user_id', userId)
      .eq('customer_name', booking.customer)
      .eq('booking_date', booking.date);
    
    if (fetchError) {
      console.error('Error finding original booking:', fetchError);
      throw fetchError;
    }
    
    if (matchingBookings && matchingBookings.length > 0) {
      const bookingId = matchingBookings[0].id;
      console.log("Found matching booking ID:", bookingId);
      return bookingId;
    } else {
      // Fallback if we can't find the booking
      console.warn("Could not find matching booking, using converted ID");
      return booking.id.toString();
    }
  } catch (error) {
    console.error('Error in findOriginalBookingId:', error);
    return booking.id.toString();
  }
};

/**
 * Updates the booking in Supabase
 */
export const updateBookingInSupabase = async (booking: BookingType, userId: string, bookingCost?: number) => {
  try {
    const { error: updateError } = await supabase
      .from('user_bookings')
      .update({
        customer_name: booking.customer,
        customer_phone: booking.phone,
        service: booking.service,
        booking_time: booking.time,
        duration: booking.duration,
        car: booking.car,
        status: booking.status,
        booking_date: booking.date,
        technician_id: booking.technician_id || null,
        service_id: booking.service_id || null,
        bay_id: booking.bay_id || null,
        notes: booking.notes || null,
        cost: bookingCost || booking.cost
      })
      .eq('id', booking.id.toString())
      .eq('user_id', userId); // Ensure we only update the user's own booking
    
    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateBookingInSupabase:', error);
    throw error;
  }
};
