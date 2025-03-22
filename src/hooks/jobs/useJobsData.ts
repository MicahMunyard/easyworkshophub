
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobType } from "@/types/job";

export const useJobsData = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform to match JobType interface
        const transformedJobs = data.map(job => ({
          id: job.id,
          customer: job.customer,
          vehicle: job.vehicle,
          service: job.service,
          status: job.status,
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

  // Also set up a subscription for real-time updates from both jobs and bookings tables
  useEffect(() => {
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
        () => {
          fetchJobs();
        }
      )
      .subscribe();
      
    // Also listen to booking changes since bookings can affect jobs
    const bookingsChannel = supabase
      .channel('bookings-jobs-sync')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings' 
        }, 
        () => {
          fetchJobs();
        }
      )
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  return {
    jobs,
    isLoading,
    fetchJobs
  };
};
