
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Syncs the job data with the booking data when a booking is updated
 */
export const syncJobWithBooking = async (booking: BookingType, userId: string) => {
  try {
    // Skip if the booking doesn't have a status that would need a job sync
    if (!['confirmed', 'completed'].includes(booking.status)) {
      console.log(`Booking status ${booking.status} doesn't require job sync.`);
      return;
    }
    
    console.log("Syncing job with booking:", booking.id);
    
    // Check if a job already exists for this booking
    const { data: existingJobs, error: searchError } = await supabase
      .from('user_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('title', `${booking.service} - ${booking.customer}`)
      .eq('vehicle', booking.car);
      
    if (searchError) {
      console.error('Error searching for existing job:', searchError);
      return;
    }
    
    // Map booking status to job status
    const jobStatus = booking.status === 'completed' 
      ? 'completed' 
      : 'in_progress';
    
    const jobData = {
      title: `${booking.service} - ${booking.customer}`,
      description: `${booking.service} booking on ${booking.date} at ${booking.time}`,
      customer_name: booking.customer,
      vehicle: booking.car,
      status: jobStatus,
      bay_id: booking.bay_id || null,
      technician_id: booking.technician_id || null,
      start_date: new Date(`${booking.date}T${booking.time}`).toISOString(),
      cost: booking.cost || null,
      user_id: userId
    };
    
    if (existingJobs && existingJobs.length > 0) {
      // Update existing job
      const jobId = existingJobs[0].id;
      
      const { error: updateError } = await supabase
        .from('user_jobs')
        .update(jobData)
        .eq('id', jobId);
        
      if (updateError) {
        console.error('Error updating job:', updateError);
      } else {
        console.log("Job updated successfully");
      }
    } else {
      // Create new job
      const { error: createError } = await supabase
        .from('user_jobs')
        .insert(jobData);
        
      if (createError) {
        console.error('Error creating job:', createError);
      } else {
        console.log("Job created successfully");
      }
    }
  } catch (error) {
    console.error('Error in syncJobWithBooking:', error);
  }
};
