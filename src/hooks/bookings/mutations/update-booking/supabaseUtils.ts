
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

export const updateBookingInSupabase = async (
  updatedBooking: BookingType, 
  userId: string,
  bookingCost: number | null | undefined
) => {
  console.log("Updating booking in Supabase:", updatedBooking, "Cost:", bookingCost);
  console.log("Booking ID:", updatedBooking.id, "Type:", typeof updatedBooking.id);
  
  // Get the original booking first to compare fields
  const { data: originalBooking, error: fetchError } = await supabase
    .from('user_bookings')
    .select('*')
    .eq('id', typeof updatedBooking.id === 'number' ? updatedBooking.id.toString() : updatedBooking.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error("Error fetching original booking:", fetchError);
    throw fetchError;
  }
  
  // Prepare update data
  const updateData: any = {
    customer_name: updatedBooking.customer,
    customer_phone: updatedBooking.phone,
    customer_email: updatedBooking.email,
    service: updatedBooking.service,
    booking_time: updatedBooking.time,
    duration: updatedBooking.duration,
    car: updatedBooking.car,
    status: updatedBooking.status,
    booking_date: updatedBooking.date,
    notes: updatedBooking.notes,
    technician_id: updatedBooking.technician_id || null,
    service_id: updatedBooking.service_id || null,
    bay_id: updatedBooking.bay_id || null
  };
  
  // Only include cost if it's defined and different from the original
  if (bookingCost !== undefined && bookingCost !== null) {
    updateData.cost = bookingCost;
  }
  
  console.log("Final update data:", updateData);
  
  // Update user_bookings table with more flexible ID handling
  const { error: updateError } = await supabase
    .from('user_bookings')
    .update(updateData)
    .eq('id', typeof updatedBooking.id === 'number' ? updatedBooking.id.toString() : updatedBooking.id)
    .eq('user_id', userId);
  
  if (updateError) {
    console.error("Error updating booking:", updateError);
    throw updateError;
  }
};
