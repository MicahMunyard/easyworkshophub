
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { updateCustomerOnBookingChange } from "./customerUtils";
import { syncJobWithBooking } from "./jobUtils";
import { updateBookingInSupabase } from "./supabaseUtils";
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

      // Extract service price if it's included in the booking
      let bookingCost = updatedBooking.cost;
      
      // If status is completed and cost isn't set, try to get service price
      if (updatedBooking.status === 'completed' && !bookingCost && updatedBooking.service_id) {
        console.log("Booking marked as completed, fetching service price");
        const { data: serviceData } = await supabase
          .from('user_services')
          .select('price')
          .eq('id', updatedBooking.service_id)
          .single();
          
        if (serviceData && serviceData.price) {
          bookingCost = parseFloat(String(serviceData.price));
          console.log(`Using service price for completed booking: ${bookingCost}`);
        }
      }
      
      // Update Supabase with the booking
      await updateBookingInSupabase(updatedBooking, user.id, bookingCost);

      // Update customer data (last visit date, etc)
      await updateCustomerOnBookingChange(updatedBooking, user.id, bookingCost);
      
      // Sync the related job
      await syncJobWithBooking(updatedBooking, user.id);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      );
      
      toast({
        title: "Booking Updated",
        description: `${updatedBooking.customer}'s booking has been updated.`,
      });
      
      // Refresh bookings to ensure consistency
      await fetchBookings();
      
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { updateBooking };
};
