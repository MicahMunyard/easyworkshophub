
import { v4 as uuidv4 } from 'uuid';
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAddBooking = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const addBooking = async (newBooking: BookingType) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create bookings.",
          variant: "destructive"
        });
        return false;
      }

      console.log("Adding new booking:", newBooking);
      
      // Generate a proper UUID for the booking
      const bookingId = uuidv4();
      
      // Insert into user_bookings table instead of bookings
      const { error: bookingError } = await supabase
        .from('user_bookings')
        .insert({
          id: bookingId,
          user_id: user.id, // Add the user ID to associate the booking with the logged-in user
          customer_name: newBooking.customer,
          customer_phone: newBooking.phone,
          service: newBooking.service,
          booking_time: newBooking.time,
          duration: newBooking.duration,
          car: newBooking.car,
          status: newBooking.status,
          booking_date: newBooking.date,
          technician_id: newBooking.technician_id || null,
          service_id: newBooking.service_id || null,
          bay_id: newBooking.bay_id || null
        });
      
      if (bookingError) {
        console.error('Error creating booking in Supabase:', bookingError);
        throw bookingError;
      }
      
      // Create associated job
      const jobId = uuidv4().substring(0, 8);
      console.log(`Creating job with ID ${jobId} for booking ${bookingId}`);
      
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          id: jobId,
          customer: newBooking.customer,
          vehicle: newBooking.car,
          service: newBooking.service,
          status: newBooking.status === 'confirmed' ? 'pending' : 'pending',
          assigned_to: newBooking.technician_id ? newBooking.technician_id : 'Unassigned',
          date: newBooking.date,
          time_estimate: `${newBooking.duration} minutes`,
          priority: 'Medium'
        });
      
      if (jobError) {
        console.error('Error creating job in Supabase:', jobError);
        // Continue despite job creation error
      }
      
      // Update local state with the new booking
      const bookingWithProperID: BookingType = {
        ...newBooking,
        id: parseInt(bookingId.replace(/-/g, '').substring(0, 8), 16)
      };
      
      setBookings(prev => [...prev, bookingWithProperID]);
      
      toast({
        title: "Booking Created",
        description: `${newBooking.customer}'s booking has been added.`,
      });
      
      await fetchBookings(); // Refresh bookings to ensure consistency
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { addBooking };
};
