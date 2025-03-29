
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Finds and deletes jobs associated with a booking
 */
export const deleteAssociatedJobs = async (booking: BookingType, userId: string) => {
  try {
    console.log("Looking for jobs to delete with customer:", booking.customer);
    
    // First try to find jobs with BKG- prefix in the ID that match the customer and date
    const { data: matchingJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('user_id', userId)
      .ilike('id', 'BKG-%')
      .eq('customer', booking.customer)
      .eq('date', booking.date);
    
    if (jobsError) {
      console.error('Error finding matching jobs:', jobsError);
      return;
    }
    
    // If no jobs with BKG- prefix, try to find any jobs that match customer and date
    if (!matchingJobs || matchingJobs.length === 0) {
      const { data: backupJobs, error: backupJobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('customer', booking.customer)
        .eq('date', booking.date);
        
      if (backupJobsError) {
        console.error('Error finding backup matching jobs:', backupJobsError);
        return;
      }
      
      if (backupJobs && backupJobs.length > 0) {
        console.log(`Found ${backupJobs.length} backup jobs to delete`);
        await deleteJobBatch(backupJobs, userId);
      } else {
        console.log("No matching jobs found to delete");
      }
    } else {
      console.log(`Found ${matchingJobs.length} jobs to delete with BKG- prefix`);
      await deleteJobBatch(matchingJobs, userId);
    }
  } catch (error) {
    console.error("Error deleting associated jobs:", error);
  }
};

/**
 * Deletes a batch of jobs
 */
export const deleteJobBatch = async (jobs: { id: string }[], userId: string) => {
  for (const job of jobs) {
    console.log("Deleting job with ID:", job.id);
    const { error: deleteJobError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', job.id)
      .eq('user_id', userId);
    
    if (deleteJobError) {
      console.error('Error deleting job:', deleteJobError);
    } else {
      console.log("Successfully deleted job with ID:", job.id);
    }
  }
};
