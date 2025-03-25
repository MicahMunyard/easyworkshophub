
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useUpdateBooking = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const updateBooking = async (updatedBooking: BookingType) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update bookings.",
          variant: "destructive"
        });
        return false;
      }

      console.log("Updating booking:", updatedBooking);
      
      // Update UI first for better UX
      const updatedBookings = bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      
      // Find the original booking ID in Supabase format
      const { data: matchingBookings, error: fetchError } = await supabase
        .from('user_bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('customer_name', updatedBooking.customer)
        .eq('booking_date', updatedBooking.date);
      
      if (fetchError) {
        console.error('Error finding original booking:', fetchError);
        throw fetchError;
      }
      
      let bookingIdStr = '';
      if (matchingBookings && matchingBookings.length > 0) {
        bookingIdStr = matchingBookings[0].id;
        console.log("Found matching booking ID:", bookingIdStr);
      } else {
        // Fallback if we can't find the booking
        console.warn("Could not find matching booking, using converted ID");
        bookingIdStr = updatedBooking.id.toString();
      }
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('user_bookings')
        .update({
          customer_name: updatedBooking.customer,
          customer_phone: updatedBooking.phone,
          service: updatedBooking.service,
          booking_time: updatedBooking.time,
          duration: updatedBooking.duration,
          car: updatedBooking.car,
          status: updatedBooking.status,
          booking_date: updatedBooking.date,
          technician_id: updatedBooking.technician_id || null,
          service_id: updatedBooking.service_id || null,
          bay_id: updatedBooking.bay_id || null,
          notes: updatedBooking.notes || null
        })
        .eq('id', bookingIdStr)
        .eq('user_id', user.id); // Ensure we only update the user's own booking
      
      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      
      // Update or create customer record
      await updateCustomerRecord(updatedBooking);
      
      // Update associated job
      const { data: matchingJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('customer', updatedBooking.customer)
        .eq('date', updatedBooking.date);
      
      if (jobsError) {
        console.error('Error finding matching jobs:', jobsError);
      } else if (matchingJobs && matchingJobs.length > 0) {
        console.log("Updating associated job:", matchingJobs[0].id);
        await supabase
          .from('jobs')
          .update({
            vehicle: updatedBooking.car,
            service: updatedBooking.service,
            status: updatedBooking.status === 'confirmed' ? 'pending' : 
                  updatedBooking.status === 'completed' ? 'completed' : 
                  updatedBooking.status === 'cancelled' ? 'cancelled' : 'pending',
            assigned_to: updatedBooking.technician_id || 'Unassigned',
            time_estimate: `${updatedBooking.duration} minutes`
          })
          .eq('id', matchingJobs[0].id)
          .eq('user_id', user.id);
      }

      // Add booking note as customer note if there are notes
      if (updatedBooking.notes && updatedBooking.notes.trim() !== '') {
        await addBookingNoteToCustomer(updatedBooking);
      }
      
      toast({
        title: "Booking Updated",
        description: `${updatedBooking.customer}'s booking has been updated.`,
      });
      
      await fetchBookings(); // Refresh bookings to ensure consistency
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
      await fetchBookings(); // Refresh to ensure UI is in sync with database
      return false;
    }
  };

  // Helper function to update customer record
  const updateCustomerRecord = async (booking: BookingType) => {
    try {
      // Check if customer exists
      const { data: existingCustomers, error: lookupError } = await supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user.id)
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
            user_id: user.id,
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
            .eq('user_id', user.id);
        } else {
          // Just update the last visit date
          await supabase
            .from('user_customers')
            .update({ last_visit: new Date().toISOString() })
            .eq('id', customerId)
            .eq('user_id', user.id);
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

  // Helper function to add booking notes to customer notes
  const addBookingNoteToCustomer = async (booking: BookingType) => {
    try {
      if (!booking.notes || !user) return;

      // Get customer ID
      const { data: customers, error: customerError } = await supabase
        .from('user_customers')
        .select('id')
        .eq('user_id', user.id)
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
          created_by: user.email || 'System'
        });

      if (noteError) {
        console.error('Error adding booking note to customer:', noteError);
      }
    } catch (error) {
      console.error('Error processing booking note:', error);
    }
  };

  return { updateBooking };
};
