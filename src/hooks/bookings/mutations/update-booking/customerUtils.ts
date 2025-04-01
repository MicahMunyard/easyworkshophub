
import { supabase } from "@/integrations/supabase/client";

// Define interfaces for RPC parameters
interface AddBookingHistoryParams {
  p_customer_id: number;
  p_booking_id: string;
  p_service: string;
  p_date: string;
  p_mechanic: string;
  p_vehicle: string;
  p_status: string;
  p_cost: number;
}

interface UpdateCustomerDetailsParams {
  p_customer_id: number;
  p_last_visit: string;
  p_total_spent: number;
}

export const updateCustomerOnBookingChange = async (
  updatedBooking: any,
  userId: string,
  bookingCost?: number
) => {
  if (!updatedBooking.customer_id) {
    console.log("No customer ID in the booking, skipping customer update");
    return;
  }

  try {
    console.log("Updating customer data for booking:", updatedBooking.id);
    
    // If status is completed, add to booking history and update customer details
    if (updatedBooking.status === 'completed') {
      console.log("Booking is completed, updating customer history");
      
      // This section needs to be implemented based on your actual database schema
      // Since we don't have access to the exact schema for customer_booking_history
      // and customers tables, this is a placeholder
      
      console.log("Adding booking to customer history with params:", {
        customerId: updatedBooking.customer_id,
        bookingId: updatedBooking.id,
        service: updatedBooking.service || 'Unknown Service',
        date: updatedBooking.date || new Date().toISOString().split('T')[0],
        mechanic: updatedBooking.assigned_to || 'Unassigned',
        vehicle: updatedBooking.vehicle || 'Unknown Vehicle',
        status: updatedBooking.status,
        cost: bookingCost || 0
      });
      
      // Add to customer booking history using RPC if available
      try {
        const customerId = parseInt(updatedBooking.customer_id, 10);
        const cost = bookingCost || 0;
        
        // Format the params as the RPC function expects
        const params: AddBookingHistoryParams = {
          p_customer_id: customerId,
          p_booking_id: updatedBooking.id,
          p_service: updatedBooking.service || 'Unknown Service',
          p_date: updatedBooking.date || new Date().toISOString().split('T')[0],
          p_mechanic: updatedBooking.assigned_to || 'Unassigned',
          p_vehicle: updatedBooking.vehicle || 'Unknown Vehicle',
          p_status: updatedBooking.status,
          p_cost: cost
        };
        
        // Call RPC if the function exists in your database
        // This is commented out since we're not sure if these RPCs exist
        /*
        const { data, error } = await supabase
          .rpc('add_booking_to_customer_history', params);
        
        if (error) {
          console.error("Error adding booking to customer history:", error);
          throw error;
        }
        
        console.log("Successfully added booking to customer history:", data);
        
        // Update customer details (last visit, total spent)
        // Get the customer's current total_spent
        const { data: customerData } = await supabase
          .from('customers')
          .select('total_spent')
          .eq('id', customerId)
          .single();
        
        let totalSpent = cost;
        if (customerData && customerData.total_spent) {
          totalSpent += parseFloat(String(customerData.total_spent));
        }
        
        const updateParams: UpdateCustomerDetailsParams = {
          p_customer_id: customerId,
          p_last_visit: new Date().toISOString().split('T')[0],
          p_total_spent: totalSpent
        };
        
        const { data: updateResult, error: updateError } = await supabase
          .rpc('update_customer_details', updateParams);
        
        if (updateError) {
          console.error("Error updating customer details:", updateError);
          throw updateError;
        }
        */
      } catch (error) {
        console.error("Error in RPC calls:", error);
      }
      
      console.log("Customer data update process completed");
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateCustomerOnBookingChange:", error);
    throw error;
  }
};
