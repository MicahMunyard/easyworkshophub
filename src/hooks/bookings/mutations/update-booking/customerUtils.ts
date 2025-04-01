import { supabase } from "@/integrations/supabase/client";
import { BookingType } from "@/types/booking";

// Define an interface for the RPC parameters
interface CustomerTransactionParams {
  p_customer_id: string;
  p_amount: number;
  p_service_description: string;
  p_booking_id: string;
}

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
          // Define parameters for the RPC call
          const rpcParams: CustomerTransactionParams = {
            p_customer_id: customer.id,
            p_amount: bookingCost,
            p_service_description: `${booking.service} - ${booking.car}`,
            p_booking_id: booking.id
          };
          
          // Call RPC function with properly typed parameters
          const { error: updateSpendingError } = await supabase.rpc(
            'update_customer_last_visit_and_transaction',
            rpcParams
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

const syncCustomerDetails = async (bookingId: string, userData: {
  id: string;
  phone: string;
  name: string;
  email: string;
}) => {
  try {
    const { error } = await supabase
      .rpc('sync_customer_details', {
        p_booking_id: bookingId,
        p_name: userData.name,
        p_email: userData.email,
        p_phone: userData.phone
      });
      
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing customer details:', err);
    return false;
  }
};
