
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useDeleteBooking = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const deleteBooking = async (bookingToDelete: BookingType): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete bookings.",
          variant: "destructive"
        });
        return false;
      }

      console.log("Attempting to delete booking:", bookingToDelete);
      
      // Handle case where ID might be different formats
      const bookingId = bookingToDelete.id;
      console.log("Deleting booking ID:", bookingId, "Type:", typeof bookingId);
      
      // Optimistically update UI for responsiveness
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
      
      // Convert booking ID to string for safe operations
      const bookingIdStr = String(bookingId);
      
      // If it's a UUID format (contains dashes)
      if (bookingIdStr.includes('-')) {
        console.log("Deleting booking with UUID format:", bookingIdStr);
        
        // Delete from user_bookings table
        const { error: deleteError } = await supabase
          .from('user_bookings')
          .delete()
          .eq('id', bookingIdStr)
          .eq('user_id', user.id); // Ensure we only delete the user's own booking
        
        if (deleteError) {
          console.error('Error deleting from user_bookings table:', deleteError);
          throw deleteError;
        }
        
        console.log("Successfully deleted booking from user_bookings table");
      } 
      // If it's a numeric ID or a string that doesn't look like a UUID
      else {
        // Check in user_bookings table by customer and date
        console.log("Looking for booking by customer and date:", bookingToDelete.customer, bookingToDelete.date);
        
        const { data: matchingUserBookings, error: userFetchError } = await supabase
          .from('user_bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('customer_name', bookingToDelete.customer)
          .eq('booking_date', bookingToDelete.date);
        
        if (userFetchError) {
          console.error('Error finding booking in user_bookings table:', userFetchError);
          throw userFetchError;
        }
        
        if (matchingUserBookings && matchingUserBookings.length > 0) {
          const actualBookingId = matchingUserBookings[0].id;
          console.log("Found matching booking in user_bookings table with ID:", actualBookingId);
          
          // Delete using the actual ID
          const { error: deleteError } = await supabase
            .from('user_bookings')
            .delete()
            .eq('id', actualBookingId)
            .eq('user_id', user.id);
          
          if (deleteError) {
            console.error('Error deleting from user_bookings table:', deleteError);
            throw deleteError;
          }
          
          console.log("Successfully deleted booking from user_bookings table");
        } else {
          console.error("No matching booking found to delete");
          throw new Error("Booking not found in database");
        }
      }
      
      // Delete associated jobs
      await deleteAssociatedJobs(bookingToDelete);
      
      // Refresh bookings to ensure we're in sync with the database
      await fetchBookings();
      return true;
    } catch (error) {
      console.error('Error in deleteBooking:', error);
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
