
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob, JobStatus, JobNote } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";

export const useFetchJobs = (
  technicianId: string | null,
  userId: string | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>
) => {
  const { toast } = useToast();

  const fetchJobs = async (): Promise<void> => {
    if (!technicianId || !userId) return;
    
    setIsLoading(true);
    try {
      console.log(`Fetching jobs for technician ${technicianId} and user ${userId}`);
      
      // First try to get jobs from the jobs table
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .eq('assigned_to', technicianId)
        .order('date', { ascending: false });
      
      if (jobsError) {
        console.error("Error fetching from jobs table:", jobsError);
        // Don't throw here, try the second approach
      }
      
      let allJobs: TechnicianJob[] = [];
      
      // If we got jobs from the first query, transform them
      if (jobsData && jobsData.length > 0) {
        console.log(`Found ${jobsData.length} jobs in jobs table`);
        
        // Transform jobs to match our TechnicianJob interface
        const jobsFromJobsTable: TechnicianJob[] = jobsData.map(job => ({
          id: job.id,
          title: job.service,
          description: `Customer: ${job.customer}, Vehicle: ${job.vehicle}`,
          customer: job.customer,
          vehicle: job.vehicle,
          status: job.status as JobStatus,
          assignedAt: job.created_at,
          scheduledFor: job.date,
          estimatedTime: job.time_estimate,
          priority: job.priority,
          timeLogged: 0, // We'll need to calculate this from a separate time logs table
          partsRequested: [], // We'll need to fetch this from a separate parts requests table
          photos: [], // We'll need to fetch this from storage
          notes: [],
          isActive: false
        }));
        
        allJobs = [...jobsFromJobsTable];
      }
      
      // Now also check the user_bookings table for bookings assigned to this technician
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('technician_id', technicianId)
        .order('booking_date', { ascending: false });
      
      if (bookingsError) {
        console.error("Error fetching from user_bookings table:", bookingsError);
        // Continue with what we have
      }
      
      // If we got bookings, transform them to jobs and add to our collection
      if (bookingsData && bookingsData.length > 0) {
        console.log(`Found ${bookingsData.length} bookings in user_bookings table`);
        
        const jobsFromBookings: TechnicianJob[] = bookingsData.map(booking => {
          // Create a default JobNote structure for the booking notes
          const notesArray: JobNote[] = booking.notes 
            ? [{
                id: `note-${booking.id}`,
                content: booking.notes,
                created_at: booking.created_at,
                author: 'System'
              }] 
            : [];
            
          return {
            id: booking.id,
            title: booking.service,
            description: `Customer: ${booking.customer_name}, Vehicle: ${booking.car}`,
            customer: booking.customer_name,
            vehicle: booking.car,
            status: (booking.status === 'confirmed' ? 'pending' : 
                    booking.status === 'completed' ? 'completed' : 
                    booking.status === 'cancelled' ? 'cancelled' : 'pending') as JobStatus,
            assignedAt: booking.created_at,
            scheduledFor: booking.booking_date,
            estimatedTime: `${booking.duration} minutes`,
            priority: 'Medium', // Default priority
            timeLogged: 0,
            partsRequested: [],
            photos: [],
            notes: notesArray,
            isActive: false
          };
        });
        
        allJobs = [...allJobs, ...jobsFromBookings];
      }
      
      if (allJobs.length === 0) {
        console.log("No jobs or bookings found for this technician");
      } else {
        console.log("All jobs after transformation:", allJobs);
      }
      
      setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching technician jobs:', error);
      toast({
        title: "Failed to load jobs",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return fetchJobs;
};
