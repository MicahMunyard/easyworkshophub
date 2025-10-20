
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
      
      if (!user) {
        console.log("No user logged in, returning empty jobs array");
        setJobs([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log(`Fetched ${data.length} bookings for user ${user.id}`);
        // Transform to match JobType interface
        const transformedJobs = data.map(booking => ({
          id: booking.id,
          customer: booking.customer_name,
          vehicle: booking.car,
          service: booking.service,
          status: booking.status as "pending" | "confirmed" | "inProgress" | "working" | "completed" | "cancelled",
          assignedTo: booking.technician_id || '',
          date: booking.booking_date,
          time: booking.booking_time || '',
          timeEstimate: booking.time_estimate || '1 hour',
          priority: booking.priority || 'Medium',
          cost: booking.cost ? Number(booking.cost) : undefined,
          duration: booking.duration,
          customerPhone: booking.customer_phone,
          customerEmail: booking.customer_email,
          notes: booking.notes,
          totalTime: booking.total_time || 0
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
    
    // Set up real-time subscription to user_bookings changes
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_bookings',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log("User bookings table change detected:", payload);
          fetchJobs();
        }
      )
      .subscribe((status) => {
        console.log("Bookings subscription status:", status);
      });
    
    // Clean up subscription
    return () => {
      console.log("Cleaning up Supabase channel");
      supabase.removeChannel(bookingsChannel);
    };
  }, [user]);

  return {
    jobs,
    isLoading,
    fetchJobs
  };
};
