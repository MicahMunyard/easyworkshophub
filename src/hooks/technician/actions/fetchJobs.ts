
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
  const JOBS_STORAGE_KEY = `tech_jobs_${technicianId}_${userId}`;

  // Load jobs from localStorage if available
  const loadCachedJobs = (): TechnicianJob[] => {
    try {
      const cachedData = localStorage.getItem(JOBS_STORAGE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (e) {
      console.error('Error loading cached jobs:', e);
    }
    return [];
  };

  // Save jobs to localStorage
  const cacheJobs = (jobs: TechnicianJob[]) => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error('Error caching jobs:', e);
    }
  };

  // Track if we're already fetching to prevent duplicate calls
  let fetchInProgress = false;

  const fetchJobs = async (): Promise<void> => {
    if (!technicianId || !userId || fetchInProgress) return;
    
    fetchInProgress = true;
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
        // Cache the jobs we found
        cacheJobs(allJobs);
      }
      
      // Only update state if we have data or no jobs were found
      setJobs(prevJobs => {
        // Only update if the data has actually changed
        const hasChanged = JSON.stringify(prevJobs) !== JSON.stringify(allJobs);
        return hasChanged ? allJobs : prevJobs;
      });
      
    } catch (error) {
      console.error('Error fetching technician jobs:', error);
      
      // If there's an error, try to load from cache
      const cachedJobs = loadCachedJobs();
      if (cachedJobs.length > 0) {
        console.log("Loading jobs from cache due to fetch error");
        setJobs(prevJobs => {
          // Only update if the cached data is different from current
          const hasChanged = JSON.stringify(prevJobs) !== JSON.stringify(cachedJobs);
          return hasChanged ? cachedJobs : prevJobs;
        });
        
        toast({
          title: "Using cached job data",
          description: "We're having trouble connecting to the server. Showing previously loaded jobs.",
          variant: "default" 
        });
      } else {
        toast({
          title: "Failed to load jobs",
          description: "Please check your connection and try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      fetchInProgress = false;
    }
  };

  return fetchJobs;
};
