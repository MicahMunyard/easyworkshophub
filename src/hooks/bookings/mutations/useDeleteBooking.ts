
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteBooking = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { toast } = useToast();
  
  const deleteBooking = async (bookingToDelete: BookingType) => {
    try {
      console.log("Attempting to delete booking:", bookingToDelete);
      
      // Update UI immediately for better UX
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
      
      // First, check if the ID is in UUID format
      const bookingId = bookingToDelete.id;
      const bookingIdString = typeof bookingId === 'number' ? String(bookingId) : bookingId;
      
      const isUuid = typeof bookingIdString === 'string' && 
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingIdString);
      
      console.log("Booking ID:", bookingId, "Is UUID format:", isUuid);
      
      if (isUuid) {
        // If it's already a UUID format, use it directly
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingIdString);
        
        if (deleteError) {
          console.error('Error deleting booking with direct ID:', deleteError);
          throw deleteError;
        }
        
        console.log("Successfully deleted booking with UUID:", bookingIdString);
      } else {
        // Try to find the actual UUID of the booking in Supabase
        console.log("Looking for booking by customer and date:", bookingToDelete.customer, bookingToDelete.date);
        
        const { data: matchingBookings, error: fetchError } = await supabase
          .from('bookings')
          .select('id')
          .eq('customer_name', bookingToDelete.customer)
          .eq('booking_date', bookingToDelete.date);
        
        if (fetchError) {
          console.error('Error finding booking to delete:', fetchError);
          throw fetchError;
        }
        
        if (matchingBookings && matchingBookings.length > 0) {
          const actualBookingId = matchingBookings[0].id;
          console.log("Found matching booking with ID:", actualBookingId);
          
          // Delete using the actual ID
          const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', actualBookingId);
          
          if (deleteError) {
            console.error('Error deleting booking:', deleteError);
            throw deleteError;
          }
          
          console.log("Successfully deleted booking with found ID:", actualBookingId);
        } else {
          // Fallback: try to delete by customer name and date
          console.log("No exact ID match found, deleting by customer and date");
          const { error: deleteByCustomerError } = await supabase
            .from('bookings')
            .delete()
            .eq('customer_name', bookingToDelete.customer)
            .eq('booking_date', bookingToDelete.date);
          
          if (deleteByCustomerError) {
            console.error('Error deleting booking by customer:', deleteByCustomerError);
            throw deleteByCustomerError;
          }
          
          console.log("Successfully deleted booking by customer name and date");
        }
      }
      
      // Delete associated jobs
      await deleteAssociatedJobs(bookingToDelete);
      
      toast({
        title: "Booking Deleted",
        description: `${bookingToDelete.customer}'s booking has been deleted.`,
        variant: "destructive"
      });
      
      // Refresh bookings after deletion to ensure we're in sync with the database
      await fetchBookings();
      return true;
    } catch (error) {
      console.error('Error in deleteBooking:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
      
      // Refresh bookings to ensure UI is in sync with database
      await fetchBookings();
      return false;
    }
  };

  // Helper function to delete associated jobs
  const deleteAssociatedJobs = async (booking: BookingType) => {
    try {
      console.log("Looking for jobs to delete with customer:", booking.customer);
      const { data: matchingJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('customer', booking.customer)
        .eq('date', booking.date);
      
      if (jobsError) {
        console.error('Error finding matching jobs:', jobsError);
        return;
      }

      if (matchingJobs && matchingJobs.length > 0) {
        console.log(`Found ${matchingJobs.length} jobs to delete`);
        
        for (const job of matchingJobs) {
          console.log("Deleting job with ID:", job.id);
          const { error: deleteJobError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', job.id);
          
          if (deleteJobError) {
            console.error('Error deleting job:', deleteJobError);
          } else {
            console.log("Successfully deleted job with ID:", job.id);
          }
        }
      } else {
        console.log("No matching jobs found to delete");
      }
    } catch (error) {
      console.error("Error deleting associated jobs:", error);
    }
  };

  return { deleteBooking };
};
