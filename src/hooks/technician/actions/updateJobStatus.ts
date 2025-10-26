
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { JobStatus, TechnicianJob } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { createOfflineOperation, updateJobState } from "../utils/offlineUtils";
import { OfflineOperation } from "../types/offlineTypes";

export const useUpdateJobStatus = (
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>,
  setOfflineOperations: React.Dispatch<React.SetStateAction<OfflineOperation[]>>
) => {
  const { toast } = useToast();

  const updateJobStatus = async (jobId: string, newStatus: JobStatus): Promise<void> => {
    if (!navigator.onLine) {
      // Store operation for later sync
      const offlineOp = createOfflineOperation('status_update', { jobId, newStatus });
      setOfflineOperations(prev => [...prev, offlineOp]);
      
      // Update local state
      setJobs(prev => updateJobState(prev, jobId, { status: newStatus }));
      
      toast({
        title: "Job updated (offline mode)",
        description: "Changes will sync when you're back online.",
      });
      return;
    }
    
    try {
      const updates: any = { status: newStatus };

      // If completing the job, also update total_time
      if (newStatus === 'completed') {
        const { data: timeEntries } = await supabase
          .from('time_entries')
          .select('duration')
          .eq('booking_id', jobId)
          .not('duration', 'is', null);
        
        const totalTime = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;
        updates.total_time = totalTime;
      }

      const { error } = await supabase
        .from('user_bookings')
        .update(updates)
        .eq('id', jobId);
      
      if (error) throw error;
      
      // Update local state
      setJobs(prev => updateJobState(prev, jobId, { status: newStatus }));
      
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
  };

  return updateJobStatus;
};
