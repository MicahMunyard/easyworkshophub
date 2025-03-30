
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
        
        // Get current total spending if available
        const { data: spendingData } = await supabase
          .from('user_customer_spending')
          .select('total')
          .eq('customer_id', customer.id)
          .single();
        
        if (spendingData) {
          // Update existing spending record
          const newTotal = (parseFloat(String(spendingData.total)) || 0) + bookingCost;
          
          const { error: spendingUpdateError } = await supabase
            .from('user_customer_spending')
            .update({ 
              total: newTotal,
              last_updated: new Date().toISOString()
            })
            .eq('customer_id', customer.id);
            
          if (spendingUpdateError) {
            console.error('Error updating customer spending:', spendingUpdateError);
          }
        } else {
          // Create a new spending record
          const { error: spendingInsertError } = await supabase
            .from('user_customer_spending')
            .insert({
              customer_id: customer.id,
              total: bookingCost,
              last_updated: new Date().toISOString()
            });
            
          if (spendingInsertError) {
            console.error('Error creating customer spending record:', spendingInsertError);
          }
        }
        
        // Add transaction history entry
        const { error: transactionError } = await supabase
          .from('user_customer_transactions')
          .insert({
            customer_id: customer.id,
            amount: bookingCost,
            description: `${booking.service} - ${booking.car}`,
            transaction_date: new Date().toISOString(),
            booking_id: booking.id,
            transaction_type: 'service'
          });
          
        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
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
