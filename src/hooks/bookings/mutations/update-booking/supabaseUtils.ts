
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

export const updateBookingInSupabase = async (
  updatedBooking: BookingType, 
  userId: string,
  bookingCost: number | null | undefined
) => {
  console.log("Updating booking in Supabase:", updatedBooking, "Cost:", bookingCost);
  console.log("Booking ID type:", typeof updatedBooking.id, "ID value:", updatedBooking.id);
  
  // Get the original booking first to compare fields
  const { data: originalBooking, error: fetchError } = await supabase
    .from('user_bookings')
    .select('*')
    .eq('user_id', userId)
    .or(`id.eq.${updatedBooking.id},id.eq.${updatedBooking.id.toString()}`);
  
  if (fetchError || !originalBooking || originalBooking.length === 0) {
    console.error("Error fetching original booking:", fetchError);
    console.log("Trying alternative ID format...");
    
    // Try another approach to find the booking
    const { data: altBooking, error: altFetchError } = await supabase
      .from('user_bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('customer_phone', updatedBooking.phone)
      .eq('customer_name', updatedBooking.customer);
    
    if (altFetchError || !altBooking || altBooking.length === 0) {
      console.error("Error with alternative booking fetch:", altFetchError);
      throw fetchError || new Error("Could not find booking to update");
    }
    
    console.log("Found booking with alternative search:", altBooking[0]);
    
    // Use the ID from the database for the update
    const bookingId = altBooking[0].id;
    
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
    
    console.log("Final update data with alternative ID:", updateData);
    
    // Update user_bookings table with the correct ID from the database
    const { error: updateError } = await supabase
      .from('user_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .eq('user_id', userId);
    
    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw updateError;
    }
    
    return;
  }
  
  const bookingToUpdate = originalBooking[0];
  console.log("Found original booking:", bookingToUpdate);
  
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
  
  // Update user_bookings table with the correct ID from the database
  const { error: updateError } = await supabase
    .from('user_bookings')
    .update(updateData)
    .eq('id', bookingToUpdate.id)
    .eq('user_id', userId);
  
  if (updateError) {
    console.error("Error updating booking:", updateError);
    throw updateError;
  }
};
