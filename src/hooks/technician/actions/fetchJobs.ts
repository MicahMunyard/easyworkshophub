
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob, JobStatus } from "@/types/technician";
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
      // Fetch jobs from the database
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_to', technicianId)
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transform jobs to match our TechnicianJob interface
      const technicianJobs: TechnicianJob[] = data.map(job => ({
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
      
      setJobs(technicianJobs);
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
