
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUpdateBooking = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { toast } = useToast();
  
  const updateBooking = async (updatedBooking: BookingType) => {
    try {
      console.log("Updating booking:", updatedBooking);
      
      // Update UI first for better UX
      const updatedBookings = bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      
      // Find the original booking ID in Supabase format
      const { data: matchingBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('id')
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
        .from('bookings')
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
          bay_id: updatedBooking.bay_id || null
        })
        .eq('id', bookingIdStr);
      
      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      
      // Update associated job
      const { data: matchingJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
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
          .eq('id', matchingJobs[0].id);
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

  return { updateBooking };
};
