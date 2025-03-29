
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates or creates a customer record based on booking information
 */
export const updateCustomerRecord = async (booking: BookingType, userId: string) => {
  try {
    // Check if customer exists
    const { data: existingCustomers, error: lookupError } = await supabase
      .from('user_customers')
      .select('*')
      .eq('user_id', userId)
      .eq('phone', booking.phone);
      
    if (lookupError) {
      console.error('Error looking up customer:', lookupError);
      return;
    }
    
    if (!existingCustomers || existingCustomers.length === 0) {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('user_customers')
        .insert({
          user_id: userId,
          name: booking.customer,
          phone: booking.phone,
          status: 'active',
          last_visit: new Date().toISOString()
        })
        .select();
        
      if (createError) {
        console.error('Error creating customer:', createError);
        return;
      }
      
      if (newCustomer && newCustomer.length > 0) {
        // Add vehicle
        await supabase
          .from('user_customer_vehicles')
          .insert({
            customer_id: newCustomer[0].id,
            vehicle_info: booking.car
          });
      }
    } else {
      // Update existing customer
      const customerId = existingCustomers[0].id;
      
      // Update name if needed
      if (existingCustomers[0].name !== booking.customer) {
        await supabase
          .from('user_customers')
          .update({ 
            name: booking.customer,
            last_visit: new Date().toISOString()
          })
          .eq('id', customerId)
          .eq('user_id', userId);
      } else {
        // Just update the last visit date
        await supabase
          .from('user_customers')
          .update({ last_visit: new Date().toISOString() })
          .eq('id', customerId)
          .eq('user_id', userId);
      }
      
      // Check if vehicle exists
      const { data: existingVehicles } = await supabase
        .from('user_customer_vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .eq('vehicle_info', booking.car);
        
      // Add vehicle if it doesn't exist
      if (!existingVehicles || existingVehicles.length === 0) {
        await supabase
          .from('user_customer_vehicles')
          .insert({
            customer_id: customerId,
            vehicle_info: booking.car
          });
      }
    }
  } catch (error) {
    console.error('Error updating customer record:', error);
  }
};

/**
 * Adds booking notes as a customer note
 */
export const addBookingNoteToCustomer = async (booking: BookingType, userId: string) => {
  try {
    if (!booking.notes || !userId) return;

    // Get customer ID
    const { data: customers, error: customerError } = await supabase
      .from('user_customers')
      .select('id')
      .eq('user_id', userId)
      .eq('phone', booking.phone);

    if (customerError) {
      console.error('Error finding customer for note:', customerError);
      return;
    }

    if (!customers || customers.length === 0) {
      console.error('No customer found for booking note');
      return;
    }

    const customerId = parseInt(customers[0].id, 10);
    const notePrefix = `Booking note (${booking.date}, ${booking.service}): `;

    // Add note to customer_notes
    const { error: noteError } = await supabase
      .from('customer_notes')
      .insert({
        customer_id: customerId,
        note: notePrefix + booking.notes,
        created_by: userId || 'System'
      });

    if (noteError) {
      console.error('Error adding booking note to customer:', noteError);
    }
  } catch (error) {
    console.error('Error processing booking note:', error);
  }
};
