
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the job associated with a booking
 */
export const updateAssociatedJob = async (booking: BookingType, userId: string) => {
  try {
    const { data: matchingJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('customer', booking.customer)
      .eq('date', booking.date);
    
    if (jobsError) {
      console.error('Error finding matching jobs:', jobsError);
      return;
    }
    
    if (matchingJobs && matchingJobs.length > 0) {
      console.log("Updating associated job:", matchingJobs[0].id);
      
      // Map booking status to job status
      const jobStatus = 
        booking.status === 'confirmed' ? 'pending' : 
        booking.status === 'completed' ? 'completed' : 
        booking.status === 'cancelled' ? 'cancelled' : 'pending';
      
      await supabase
        .from('jobs')
        .update({
          vehicle: booking.car,
          service: booking.service,
          status: jobStatus,
          assigned_to: booking.technician_id || 'Unassigned',
          time_estimate: `${booking.duration} minutes`
        })
        .eq('id', matchingJobs[0].id)
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error updating associated job:', error);
  }
};

/**
 * Syncs a job with booking information
 * This is an alias for updateAssociatedJob to maintain backward compatibility
 */
export const syncJobWithBooking = async (booking: BookingType, userId: string) => {
  return await updateAssociatedJob(booking, userId);
};
