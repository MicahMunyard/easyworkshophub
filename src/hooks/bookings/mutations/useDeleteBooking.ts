
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
      
      // First, try to find the actual UUID of the booking in Supabase
      const { data: matchingBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_name', bookingToDelete.customer)
        .eq('booking_date', bookingToDelete.date);
      
      if (fetchError) {
        console.error('Error finding booking to delete:', fetchError);
        throw fetchError;
      }
      
      let actualBookingId: string | null = null;
      
      if (matchingBookings && matchingBookings.length > 0) {
        actualBookingId = matchingBookings[0].id;
        console.log("Found matching booking with ID:", actualBookingId);
        
        // Delete using the actual ID
        console.log("Deleting booking with ID:", actualBookingId);
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', actualBookingId);
        
        if (deleteError) {
          console.error('Error deleting booking:', deleteError);
          throw deleteError;
        }
      } else {
        // Delete by customer name and date if we couldn't find the ID
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
      }
      
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
  };

  return { deleteBooking };
};
