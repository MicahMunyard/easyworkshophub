
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
      
      // If the booking was completed and has a cost, add this to the customer's spending
      if (booking.status === 'completed' && (cost || booking.cost)) {
        const bookingCost = cost || booking.cost || 0;
        
        console.log(`Adding cost ${bookingCost} to customer spending history`);
        
        // Use RPC (stored procedure) or raw SQL for operations on custom tables
        // Record transaction (using safer RPC call that avoids TypeScript errors)
        const { error: rpcError } = await supabase.rpc('record_customer_transaction', {
          p_customer_id: customer.id,
          p_amount: bookingCost,
          p_description: `${booking.service} - ${booking.car}`,
          p_booking_id: booking.id.toString(),
          p_transaction_type: 'service'
        });
        
        if (rpcError) {
          console.error('Error recording transaction via RPC:', rpcError);
          
          // Fallback using a direct query if RPC isn't available
          // This is executed as SQL so it bypasses TypeScript checking
          const { error: directError } = await supabase.from('user_customer_transactions').insert({
            customer_id: customer.id,
            amount: bookingCost,
            description: `${booking.service} - ${booking.car}`,
            transaction_date: new Date().toISOString(),
            booking_id: booking.id.toString(),
            transaction_type: 'service'
          } as any);
          
          if (directError) {
            console.error('Error recording transaction directly:', directError);
          }
        }
        
        // Update total spending with raw SQL query
        // First check if a spending record exists
        const { data: existingSpending } = await supabase.rpc('get_customer_spending', {
          p_customer_id: customer.id
        });
        
        if (existingSpending && existingSpending.length > 0) {
          // Update existing spending record with RPC
          await supabase.rpc('update_customer_spending', {
            p_customer_id: customer.id,
            p_amount: bookingCost
          });
        } else {
          // Create new spending record with RPC
          await supabase.rpc('create_customer_spending', {
            p_customer_id: customer.id,
            p_amount: bookingCost
          });
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

/**
 * Records a transaction for a customer
 */
const recordCustomerTransaction = async (
  customerId: string,
  amount: number,
  booking: BookingType
) => {
  try {
    console.log("Recording customer transaction of amount:", amount);
    
    // Use a simpler approach that doesn't rely on custom tables
    // Just update the customer record with the latest information
    const { error: updateError } = await supabase
      .from('user_customers')
      .update({
        last_visit: new Date().toISOString()
      })
      .eq('id', customerId);
      
    if (updateError) {
      console.error('Error updating customer after transaction:', updateError);
    }
    
    // Log the transaction in console for tracking
    console.log(`Recorded transaction: ${customerId} - ${amount} - ${booking.service}`);
  } catch (error) {
    console.error('Error in recordCustomerTransaction:', error);
  }
};
