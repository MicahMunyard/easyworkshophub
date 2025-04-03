
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { loadCachedJobs, cacheJobs } from "../utils/jobCacheUtils";
import { transformJobsData, transformBookingsData } from "../utils/jobTransformUtils";

export const useFetchJobs = (
  technicianId: string | null,
  userId: string | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>
) => {
  const { toast } = useToast();
  const JOBS_STORAGE_KEY = `tech_jobs_${technicianId}_${userId}`;

  // Track if we're already fetching to prevent duplicate calls
  let fetchInProgress = false;

  const fetchJobs = async (): Promise<void> => {
    if (!technicianId || !userId || fetchInProgress) {
      console.log("Skipping fetchJobs: missing data or fetch already in progress");
      return;
    }
    
    fetchInProgress = true;
    setIsLoading(true);
    
    try {
      console.log(`Fetching jobs for technician ${technicianId} and user ${userId}`);
      
      // Fetch jobs from the jobs table
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .eq('assigned_to', technicianId)
        .order('date', { ascending: false });
      
      if (jobsError) {
        console.error("Error fetching from jobs table:", jobsError);
      }
      
      // Fetch bookings from the user_bookings table
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('technician_id', technicianId)
        .order('booking_date', { ascending: false });
      
      if (bookingsError) {
        console.error("Error fetching from user_bookings table:", bookingsError);
      }
      
      // Transform and combine job data
      const allJobs = [
        ...(jobsData ? transformJobsData(jobsData) : []),
        ...(bookingsData ? transformBookingsData(bookingsData) : [])
      ];
      
      if (allJobs.length === 0) {
        console.log("No jobs or bookings found for this technician");
      } else {
        console.log("All jobs after transformation:", allJobs);
        // Cache the jobs we found
        cacheJobs(JOBS_STORAGE_KEY, allJobs);
      }
      
      // Only update state if we have data or no jobs were found
      setJobs(prevJobs => {
        // Only update if the data has actually changed
        const hasChanged = JSON.stringify(prevJobs) !== JSON.stringify(allJobs);
        if (hasChanged) {
          console.log("Updating jobs state with new data");
          return allJobs;
        } else {
          console.log("Jobs data unchanged, keeping previous state");
          return prevJobs;
        }
      });
      
    } catch (error) {
      console.error('Error fetching technician jobs:', error);
      
      // If there's an error, try to load from cache
      const cachedJobs = loadCachedJobs(JOBS_STORAGE_KEY);
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
