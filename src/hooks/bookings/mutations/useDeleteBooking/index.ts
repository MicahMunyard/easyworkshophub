
import { BookingType } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { deleteBookingFromSupabase } from "./supabaseUtils";
import { deleteAssociatedJobs } from "./jobUtils";

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
      
      // Optimistically update UI for responsiveness
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
      
      // Delete from Supabase
      const deleteResult = await deleteBookingFromSupabase(bookingToDelete, user.id);
      
      // Find and delete associated jobs
      await deleteAssociatedJobs(bookingToDelete, user.id);
      
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

  return { deleteBooking };
};
