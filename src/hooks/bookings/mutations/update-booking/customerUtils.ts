
import { supabase } from "@/integrations/supabase/client";
import { BookingType } from "@/types/booking";

export const updateCustomerOnBookingChange = async (
  booking: BookingType,
  userId: string,
  cost?: number
) => {
  try {
    console.log("Updating customer data for booking:", booking.id);
    
    // Look up the customer by phone number
    const { data: customers, error: lookupError } = await supabase
      .from('user_customers')
      .select('*')
      .eq('user_id', userId)
      .eq('phone', booking.phone);
      
    if (lookupError) {
      console.error('Error looking up customer:', lookupError);
      return;
    }
    
    // If we found a customer, update their data
    if (customers && customers.length > 0) {
      const customer = customers[0];
      
      // Prepare update data
      const updateData: any = {
        last_visit: new Date().toISOString()
      };
      
      // Add email if it's provided and not already set
      if (booking.email && (!customer.email || customer.email.trim() === '')) {
        updateData.email = booking.email;
      }
      
      // Update the customer record
      const { error: updateError } = await supabase
        .from('user_customers')
        .update(updateData)
        .eq('id', customer.id);
        
      if (updateError) {
        console.error('Error updating customer:', updateError);
      }
      
      // If the booking was completed and has a cost, we want to track this
      if (booking.status === 'completed' && (cost || booking.cost)) {
        const bookingCost = cost || booking.cost || 0;
        console.log(`Service completed with cost ${bookingCost}`);
        
        try {
          // Call the RPC function to update customer data
          const { error: updateSpendingError } = await supabase.rpc(
            'update_customer_last_visit_and_transaction',
            {
              p_customer_id: customer.id,
              p_amount: bookingCost,
              p_service_description: `${booking.service} - ${booking.car}`,
              p_booking_id: booking.id.toString()
            }
          );
          
          if (updateSpendingError) {
            console.error('Error updating customer spending:', updateSpendingError);
            
            // If RPC fails, fall back to simple update
            const { error: fallbackError } = await supabase
              .from('user_customers')
              .update({
                last_visit: new Date().toISOString()
              })
              .eq('id', customer.id);
              
            if (fallbackError) {
              console.error('Error in fallback customer update:', fallbackError);
            }
          }
        } catch (error) {
          console.error('Error tracking customer transaction:', error);
        }
      }
      
      // Check if the customer already has this vehicle
      const { data: existingVehicles } = await supabase
        .from('user_customer_vehicles')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('vehicle_info', booking.car);
        
      // Add the vehicle if it doesn't exist
      if (!existingVehicles || existingVehicles.length === 0) {
        const { error: vehicleError } = await supabase
          .from('user_customer_vehicles')
          .insert({
            customer_id: customer.id,
            vehicle_info: booking.car
          });
          
        if (vehicleError) {
          console.error('Error adding vehicle to customer:', vehicleError);
        }
      }
    }
  } catch (error) {
    console.error('Error in updateCustomerOnBookingChange:', error);
  }
};
