
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBookingMutations = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { toast } = useToast();

  const addBooking = async (newBooking: BookingType) => {
    try {
      console.log("Adding new booking:", newBooking);
      
      // Generate a proper UUID for the booking
      const bookingId = uuidv4();
      
      // Insert into Supabase
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
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
      }
      
      let actualBookingId: string | null = null;
      
      if (matchingBookings && matchingBookings.length > 0) {
        actualBookingId = matchingBookings[0].id;
        console.log("Found matching booking with ID:", actualBookingId);
      }
      
      // Delete by customer name and date if we couldn't find the ID
      if (!actualBookingId) {
        console.log("No exact ID match found, deleting by customer and date");
        const { error: deleteByCustomerError } = await supabase
          .from('bookings')
          .delete()
          .eq('customer_name', bookingToDelete.customer)
          .eq('booking_date', bookingToDelete.date);
        
        if (deleteByCustomerError) {
          throw deleteByCustomerError;
        }
      } else {
        // Delete using the actual ID
        console.log("Deleting booking with ID:", actualBookingId);
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', actualBookingId);
        
        if (deleteError) {
          throw deleteError;
        }
      }
      
      // Delete any associated jobs
      console.log("Looking for jobs to delete with customer:", bookingToDelete.customer);
      const { data: matchingJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('customer', bookingToDelete.customer)
        .eq('date', bookingToDelete.date);
      
      if (jobsError) {
        console.error('Error finding matching jobs:', jobsError);
      } else if (matchingJobs && matchingJobs.length > 0) {
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

  return {
    addBooking,
    updateBooking,
    deleteBooking
  };
};
