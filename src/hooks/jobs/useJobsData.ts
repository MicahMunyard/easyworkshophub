
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobType } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";

export const useJobsData = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching jobs from Supabase...");
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log(`Fetched ${data.length} jobs`);
        // Transform to match JobType interface
        const transformedJobs = data.map(job => ({
          id: job.id,
          customer: job.customer,
          vehicle: job.vehicle,
          service: job.service,
          status: job.status as "pending" | "inProgress" | "working" | "completed" | "cancelled",
          assignedTo: job.assigned_to,
          date: job.date,
          timeEstimate: job.time_estimate,
          priority: job.priority
        })) as JobType[];
        
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up a subscription for real-time updates from both jobs and bookings tables
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    console.log("Setting up real-time subscriptions for jobs");
    fetchJobs();
    
    // Set up real-time subscription to jobs changes
    const jobsChannel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs' 
        }, 
        (payload) => {
          console.log("Jobs table change detected:", payload);
          fetchJobs();
        }
      )
      .subscribe((status) => {
        console.log("Jobs subscription status:", status);
      });
      
    // Also listen to user_bookings changes since bookings affect jobs
    const bookingsChannel = supabase
      .channel('bookings-jobs-sync')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_bookings' 
        }, 
        (payload) => {
          console.log("User bookings table change detected:", payload);
          fetchJobs();
        }
      )
      .subscribe((status) => {
        console.log("User bookings subscription status:", status);
      });
    
    // Clean up subscriptions
    return () => {
      console.log("Cleaning up Supabase channels");
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [user]);

  return {
    jobs,
    isLoading,
    fetchJobs
  };
};
