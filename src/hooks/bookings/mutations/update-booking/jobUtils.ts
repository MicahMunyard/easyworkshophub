
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

export const syncJobWithBooking = async (updatedBooking: BookingType, userId: string) => {
  try {
    console.log("Syncing job with booking:", updatedBooking);
    
    // Look for an associated job from this booking
    const { data: existingJobs, error: searchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .like('id', `BKG-%`);
    
    if (searchError) {
      console.error("Error searching for related job:", searchError);
      return; // Continue the booking update process
    }
    
    // Get technician name if available
    let technicianName = 'Unassigned';
    if (updatedBooking.technician_id) {
      const { data: techData } = await supabase
        .from('user_technicians')
        .select('name')
        .eq('id', updatedBooking.technician_id)
        .single();
        
      if (techData) {
        technicianName = techData.name;
      }
    }
    
    // Check if any of the jobs are related to this specific booking
    // This is difficult without a direct reference, so we'll use a heuristic
    const relatedJob = existingJobs?.find(job => 
      job.customer === updatedBooking.customer && 
      job.vehicle === updatedBooking.car && 
      job.date === updatedBooking.date
    );
    
    if (relatedJob) {
      console.log("Found related job to update:", relatedJob.id);
      
      // Update the existing job
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          customer: updatedBooking.customer,
          vehicle: updatedBooking.car,
          service: updatedBooking.service,
          status: updatedBooking.status === 'confirmed' ? 'pending' : updatedBooking.status,
          assigned_to: technicianName,
          date: updatedBooking.date,
          time: updatedBooking.time
        })
        .eq('id', relatedJob.id)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error("Error updating job:", updateError);
        // Continue with the booking update
      } else {
        console.log("Successfully updated related job");
      }
    } else {
      console.log("No related job found, this might be a new booking");
    }
  } catch (error) {
    console.error("Error syncing job with booking:", error);
    // Continue with the booking update process
  }
};
