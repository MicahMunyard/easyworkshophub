
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
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
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
