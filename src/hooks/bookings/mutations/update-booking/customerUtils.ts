
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
        
        // Create a transaction record for the service
        await recordCustomerTransaction(customer.id, bookingCost, booking);
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
    // Insert transaction record
    const { error: transactionError } = await supabase
      .from('user_customer_transactions')
      .insert({
        customer_id: customerId,
        amount: amount,
        description: `${booking.service} - ${booking.car}`,
        transaction_date: new Date().toISOString(),
        booking_id: booking.id.toString(),
        transaction_type: 'service'
      });
      
    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      return;
    }
    
    // Update the customer's total spending
    // First try to get existing spending record
    const { data: spendingData, error: spendingQueryError } = await supabase
      .from('user_customer_spending')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();
    
    if (spendingQueryError) {
      console.error('Error querying customer spending:', spendingQueryError);
      return;
    }
    
    if (spendingData) {
      // Update existing record
      const currentTotal = parseFloat(String(spendingData.total || 0));
      const newTotal = currentTotal + amount;
      
      const { error: updateError } = await supabase
        .from('user_customer_spending')
        .update({
          total: newTotal,
          last_updated: new Date().toISOString()
        })
        .eq('customer_id', customerId);
      
      if (updateError) {
        console.error('Error updating customer spending:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_customer_spending')
        .insert({
          customer_id: customerId,
          total: amount,
          last_updated: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating customer spending record:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in recordCustomerTransaction:', error);
  }
};
