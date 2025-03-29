
import { BookingType } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { findOriginalBookingId, updateBookingInSupabase } from "./supabaseUtils";
import { updateCustomerRecord, addBookingNoteToCustomer } from "./customerUtils";
import { updateAssociatedJob } from "./jobUtils";

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
      const bookingIdStr = await findOriginalBookingId(updatedBooking, user.id);
      
      // Update in Supabase
      await updateBookingInSupabase(updatedBooking, bookingIdStr, user.id);
      
      // Update or create customer record
      await updateCustomerRecord(updatedBooking, user.id);
      
      // Update associated job
      await updateAssociatedJob(updatedBooking, user.id);

      // Add booking note as customer note if there are notes
      if (updatedBooking.notes && updatedBooking.notes.trim() !== '') {
        await addBookingNoteToCustomer(updatedBooking, user.id);
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

export default useUpdateBooking;
