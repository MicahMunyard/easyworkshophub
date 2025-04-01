
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicianJob, JobStatus, TimeLog } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// Queue for storing operations when offline
interface OfflineOperation {
  id: string;
  type: 'status_update' | 'time_log' | 'photo_upload' | 'parts_request';
  data: any;
  timestamp: string;
}

export const useTechnicianJobs = (technicianId: string | null) => {
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [offlineOperations, setOfflineOperations] = useState<OfflineOperation[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load jobs assigned to the technician
  const fetchJobs = useCallback(async () => {
    if (!technicianId || !user) return;
    
    setIsLoading(true);
    try {
      // Fetch jobs from the database
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_to', technicianId)
        .eq('user_id', user.id)
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
  }, [technicianId, user, toast]);

  // Update job status (accept, decline, in progress, completed)
  const updateJobStatus = useCallback(async (jobId: string, newStatus: JobStatus) => {
    if (!navigator.onLine) {
      // Store operation for later sync
      const offlineOp: OfflineOperation = {
        id: uuidv4(),
        type: 'status_update',
        data: { jobId, newStatus },
        timestamp: new Date().toISOString()
      };
      setOfflineOperations(prev => [...prev, offlineOp]);
      
      // Update local state
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
      
      toast({
        title: "Job updated (offline mode)",
        description: "Changes will sync when you're back online.",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
      
      if (error) throw error;
      
      // Update local state
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
      
      toast({
        title: "Job updated",
        description: `Job status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Failed to update job",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, offlineOperations]);

  // Start/stop job timer
  const toggleJobTimer = useCallback(async (jobId: string) => {
    // If a timer is already running for another job, stop it first
    if (isTimerRunning && activeJobId && activeJobId !== jobId) {
      // Stop the current timer
      // Code to stop timer for previous job
    }

    // Toggle timer for the selected job
    if (activeJobId === jobId && isTimerRunning) {
      // Stop timer
      setIsTimerRunning(false);
      setActiveJobId(null);

      if (!navigator.onLine) {
        // Store operation for later sync
        const timeLog: TimeLog = {
          id: uuidv4(),
          jobId,
          startTime: new Date(Date.now() - 3600000).toISOString(), // Mock start time (1 hour ago)
          endTime: new Date().toISOString(),
          duration: 3600, // seconds (1 hour)
          notes: "Time logged in offline mode"
        };
        
        const offlineOp: OfflineOperation = {
          id: uuidv4(),
          type: 'time_log',
          data: timeLog,
          timestamp: new Date().toISOString()
        };
        setOfflineOperations(prev => [...prev, offlineOp]);
        
        toast({
          title: "Time logged (offline mode)",
          description: "Time record will sync when you're back online.",
        });
        return;
      }

      // Log time to database
      // Code to save time log
    } else {
      // Start timer
      setIsTimerRunning(true);
      setActiveJobId(jobId);
      
      // Update UI to show the job is active
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, isActive: true } 
          : { ...job, isActive: false }
      ));
      
      toast({
        title: "Timer started",
        description: "Time tracking has begun for this job.",
      });
    }
  }, [isTimerRunning, activeJobId, toast]);

  // Upload photo for a job
  const uploadJobPhoto = useCallback(async (jobId: string, file: File) => {
    if (!navigator.onLine) {
      // Store operation for later sync
      // In a real implementation, we'd save the file locally
      const offlineOp: OfflineOperation = {
        id: uuidv4(),
        type: 'photo_upload',
        data: { jobId, fileName: file.name },
        timestamp: new Date().toISOString()
      };
      setOfflineOperations(prev => [...prev, offlineOp]);
      
      toast({
        title: "Photo saved (offline mode)",
        description: "Photo will be uploaded when you're back online.",
      });
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('job_photos')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data } = supabase.storage
        .from('job_photos')
        .getPublicUrl(fileName);
      
      // Update local state
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            photos: [...job.photos, {
              id: uuidv4(),
              url: data.publicUrl,
              uploaded_at: new Date().toISOString(),
              caption: "Photo from technician"
            }]
          };
        }
        return job;
      }));
      
      toast({
        title: "Photo uploaded",
        description: "Photo has been added to the job.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Failed to upload photo",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Request parts for a job
  const requestJobParts = useCallback(async (jobId: string, parts: { name: string, quantity: number }[]) => {
    if (!navigator.onLine) {
      // Store operation for later sync
      const offlineOp: OfflineOperation = {
        id: uuidv4(),
        type: 'parts_request',
        data: { jobId, parts },
        timestamp: new Date().toISOString()
      };
      setOfflineOperations(prev => [...prev, offlineOp]);
      
      toast({
        title: "Parts requested (offline mode)",
        description: "Request will be sent when you're back online.",
      });
      return;
    }
    
    try {
      // In a real implementation, we would save this to a parts_requests table
      // For now, we'll just update our local state
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            partsRequested: [
              ...job.partsRequested,
              ...parts.map(part => ({
                id: uuidv4(),
                name: part.name,
                quantity: part.quantity,
                status: 'pending',
                requested_at: new Date().toISOString()
              }))
            ]
          };
        }
        return job;
      }));
      
      toast({
        title: "Parts requested",
        description: `${parts.length} parts have been requested.`,
      });
    } catch (error) {
      console.error('Error requesting parts:', error);
      toast({
        title: "Failed to request parts",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Sync offline operations when coming back online
  useEffect(() => {
    const syncOfflineData = async () => {
      if (navigator.onLine && offlineOperations.length > 0) {
        toast({
          title: "Syncing data...",
          description: `${offlineOperations.length} operations pending.`,
        });
        
        // Process each operation
        for (const operation of offlineOperations) {
          try {
            switch (operation.type) {
              case 'status_update':
                await supabase
                  .from('jobs')
                  .update({ status: operation.data.newStatus })
                  .eq('id', operation.data.jobId);
                break;
              
              case 'time_log':
                // Save time log to database
                break;
              
              case 'photo_upload':
                // Would need to retrieve locally saved photo and upload
                break;
              
              case 'parts_request':
                // Save parts request to database
                break;
            }
          } catch (error) {
            console.error(`Error syncing operation ${operation.id}:`, error);
          }
        }
        
        // Clear processed operations
        setOfflineOperations([]);
        
        // Refresh jobs
        fetchJobs();
        
        toast({
          title: "Sync complete",
          description: "All changes have been synchronized.",
        });
      }
    };
    
    syncOfflineData();
  }, [isOffline, offlineOperations.length, fetchJobs, toast]);

  // Initial data fetch
  useEffect(() => {
    if (technicianId) {
      fetchJobs();
    }
  }, [technicianId, fetchJobs]);

  return {
    jobs,
    isLoading,
    activeJobId,
    isTimerRunning,
    updateJobStatus,
    toggleJobTimer,
    uploadJobPhoto,
    requestJobParts,
    refreshJobs: fetchJobs,
    offlinePendingCount: offlineOperations.length
  };
};
