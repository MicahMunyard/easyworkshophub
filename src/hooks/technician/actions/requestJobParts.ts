
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob, PartRequest } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { createOfflineOperation } from "../utils/offlineUtils";
import { OfflineOperation } from "../types/offlineTypes";

export const useRequestJobParts = (
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>,
  setOfflineOperations: React.Dispatch<React.SetStateAction<OfflineOperation[]>>,
  technicianId: string | null
) => {
  const { toast } = useToast();

  const requestJobParts = async (jobId: string, parts: { name: string, quantity: number }[]): Promise<void> => {
    if (!technicianId) {
      toast({
        title: "Error",
        description: "Technician ID not found",
        variant: "destructive"
      });
      return;
    }

    if (!navigator.onLine) {
      // Store operation for later sync
      const offlineOp = createOfflineOperation('parts_request', { jobId, parts, technicianId });
      setOfflineOperations(prev => [...prev, offlineOp]);
      
      toast({
        title: "Parts requested (offline mode)",
        description: "Request will be sent when you're back online.",
      });
      return;
    }
    
    try {
      // Save parts requests to database
      const requests = parts.map(part => ({
        job_id: jobId,
        part_name: part.name,
        quantity: part.quantity,
        requested_by: technicianId,
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('job_parts_requests')
        .insert(requests)
        .select();

      if (error) throw error;

      // Update local state with new parts from database
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          const newParts: PartRequest[] = (data || []).map(part => ({
            id: part.id,
            name: part.part_name,
            quantity: part.quantity,
            status: part.status as any,
            requested_at: part.requested_at
          }));
          
          return {
            ...job,
            partsRequested: [
              ...(job.partsRequested || []),
              ...newParts
            ]
          };
        }
        return job;
      }));
      
      toast({
        title: "Parts requested",
        description: `${parts.length} part${parts.length > 1 ? 's have' : ' has'} been requested.`,
      });
    } catch (error) {
      console.error('Error requesting parts:', error);
      toast({
        title: "Failed to request parts",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return requestJobParts;
};
