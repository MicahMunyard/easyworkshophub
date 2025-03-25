
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
          user_id: user.id,
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
      
      // Check if a customer with this phone already exists
      const { data: existingCustomers, error: customerLookupError } = await supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user.id)
        .eq('phone', newBooking.phone);
        
      if (customerLookupError) {
        console.error('Error looking up customer:', customerLookupError);
        // Continue with booking creation even if customer lookup fails
      }
      
      // If customer doesn't exist, create a new one
      if (!existingCustomers || existingCustomers.length === 0) {
        console.log("Creating new customer record for booking");
        
        const { data: newCustomer, error: customerError } = await supabase
          .from('user_customers')
          .insert({
            user_id: user.id,
            name: newBooking.customer,
            phone: newBooking.phone,
            status: 'active',
            last_visit: new Date().toISOString()
          })
          .select();
          
        if (customerError) {
          console.error('Error creating customer record:', customerError);
          // Continue with booking creation even if customer creation fails
        } else if (newCustomer && newCustomer.length > 0) {
          // Add the vehicle to the customer
          const { error: vehicleError } = await supabase
            .from('user_customer_vehicles')
            .insert({
              customer_id: newCustomer[0].id,
              vehicle_info: newBooking.car
            });
            
          if (vehicleError) {
            console.error('Error adding vehicle to customer:', vehicleError);
          }
        }
      } else {
        // Update existing customer's last visit
        const customerId = existingCustomers[0].id;
        
        // Update the last visit date
        const { error: updateError } = await supabase
          .from('user_customers')
          .update({ last_visit: new Date().toISOString() })
          .eq('id', customerId);
          
        if (updateError) {
          console.error('Error updating customer last visit:', updateError);
        }
        
        // Check if this vehicle already exists for the customer
        const { data: existingVehicles, error: vehicleLookupError } = await supabase
          .from('user_customer_vehicles')
          .select('*')
          .eq('customer_id', customerId)
          .eq('vehicle_info', newBooking.car);
          
        if (vehicleLookupError) {
          console.error('Error looking up vehicles:', vehicleLookupError);
        }
        
        // Add the vehicle if it doesn't exist yet
        if (!existingVehicles || existingVehicles.length === 0) {
          const { error: vehicleError } = await supabase
            .from('user_customer_vehicles')
            .insert({
              customer_id: customerId,
              vehicle_info: newBooking.car
            });
            
          if (vehicleError) {
            console.error('Error adding vehicle to customer:', vehicleError);
          }
        }
      }
      
      // Create associated job - use a unique ID prefix to identify it's from a booking
      const jobId = `BKG-${uuidv4().substring(0, 8)}`;
      console.log(`Creating job with ID ${jobId} for booking ${bookingId}`);
      
      // Get technician name if available
      let assignedTo = 'Unassigned';
      if (newBooking.technician_id) {
        const { data: techData } = await supabase
          .from('user_technicians')
          .select('name')
          .eq('id', newBooking.technician_id)
          .single();
          
        if (techData) {
          assignedTo = techData.name;
        }
      }
      
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          id: jobId,
          customer: newBooking.customer,
          vehicle: newBooking.car,
          service: newBooking.service,
          status: newBooking.status === 'confirmed' ? 'pending' : 'pending',
          assigned_to: assignedTo,
          date: newBooking.date,
          time: newBooking.time, // Adding the time from the booking
          time_estimate: `${newBooking.duration} minutes`,
          priority: 'Medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id
        });
      
      if (jobError) {
        console.error('Error creating job in Supabase:', jobError);
        // Log the error but continue (don't fail the booking creation)
        toast({
          title: "Warning",
          description: "Booking created, but there was an issue creating the associated job.",
          variant: "default"
        });
      } else {
        console.log("Successfully created job:", jobId);
      }
      
      // Update local state with the new booking
      // Convert the string bookingId to a number for the BookingType
      // Here's the fix: We need to generate a number ID from the UUID for local state
      const numericId = parseInt(bookingId.replace(/-/g, '').substring(0, 8), 16);
      
      const bookingWithProperID: BookingType = {
        ...newBooking,
        id: numericId // Using the numeric ID here instead of the string UUID
      };
      
      setBookings(prev => [...prev, bookingWithProperID]);
      
      toast({
        title: "Booking Created",
        description: `${newBooking.customer}'s booking has been added and job created.`,
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
