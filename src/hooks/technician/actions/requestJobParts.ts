
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob, PartRequest } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { createOfflineOperation } from "../utils/offlineUtils";
import { OfflineOperation } from "../types/offlineTypes";

export const useRequestJobParts = (
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>,
  setOfflineOperations: React.Dispatch<React.SetStateAction<OfflineOperation[]>>
) => {
  const { toast } = useToast();

  const requestJobParts = async (jobId: string, parts: { name: string, quantity: number }[]): Promise<void> => {
    if (!navigator.onLine) {
      // Store operation for later sync
      const offlineOp = createOfflineOperation('parts_request', { jobId, parts });
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
          const newParts: PartRequest[] = parts.map(part => ({
            id: uuidv4(),
            name: part.name,
            quantity: part.quantity,
            status: 'pending',
            requested_at: new Date().toISOString()
          }));
          
          return {
            ...job,
            partsRequested: [
              ...job.partsRequested,
              ...newParts
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
  };

  return requestJobParts;
};
