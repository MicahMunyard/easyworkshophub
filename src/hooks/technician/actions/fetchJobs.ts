
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { loadCachedJobs, cacheJobs, getLastFetchTime, setLastFetchTime } from "../utils/jobCacheUtils";
import { transformJobsData, transformBookingsData } from "../utils/jobTransformUtils";

export const useFetchJobs = (
  technicianId: string | null,
  userId: string | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>
) => {
  const { toast } = useToast();
  const JOBS_STORAGE_KEY = `tech_jobs_${technicianId}_${userId}`;
  const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Fetch jobs from API or cache
  const fetchJobs = useCallback(async (): Promise<void> => {
    if (!technicianId || !userId) {
      console.log("Skipping fetchJobs: missing technician ID or user ID");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const isOnline = navigator.onLine;
      const lastFetchTime = getLastFetchTime(JOBS_STORAGE_KEY);
      const cacheAge = lastFetchTime ? Date.now() - lastFetchTime : Infinity;
      const shouldUseCache = !isOnline || (cacheAge < CACHE_MAX_AGE);
      
      // If offline or cache is recent, try to load from cache first
      if (shouldUseCache) {
        const cachedJobs = loadCachedJobs(JOBS_STORAGE_KEY);
        
        if (cachedJobs.length > 0) {
          console.log("Using cached job data");
          setJobs(cachedJobs);
          
          if (!isOnline) {
            setIsLoading(false);
            
            toast({
              title: "Using offline data",
              description: "You're currently offline. Showing your cached jobs.",
              variant: "default" 
            });
            
            return;
          }
        }
      }
      
      if (!isOnline) {
        setIsLoading(false);
        
        if (!lastFetchTime) {
          toast({
            title: "No job data available",
            description: "You're offline and no cached data was found.",
            variant: "destructive"
          });
        }
        
        return;
      }
      
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
        throw jobsError;
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
        throw bookingsError;
      }
      
      // Transform and combine job data
      const transformedJobs = [
        ...(jobsData ? transformJobsData(jobsData) : []),
        ...(bookingsData ? transformBookingsData(bookingsData) : [])
      ];
      
      if (transformedJobs.length === 0) {
        console.log("No jobs or bookings found for this technician");
      } else {
        console.log(`Successfully fetched ${transformedJobs.length} total jobs`);
        
        // Cache the jobs we found
        cacheJobs(JOBS_STORAGE_KEY, transformedJobs);
        setLastFetchTime(JOBS_STORAGE_KEY);
      }
      
      // Update state with new data
      setJobs(transformedJobs);
      
    } catch (error) {
      console.error('Error fetching technician jobs:', error);
      
      // If there's an error, try to load from cache
      const cachedJobs = loadCachedJobs(JOBS_STORAGE_KEY);
      if (cachedJobs.length > 0) {
        console.log("Loading jobs from cache due to fetch error");
        setJobs(cachedJobs);
        
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
    }
  }, [technicianId, userId, setJobs, setIsLoading, toast, JOBS_STORAGE_KEY]);

  return fetchJobs;
};
