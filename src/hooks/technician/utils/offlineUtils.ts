
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { OfflineOperation } from "../types/offlineTypes";
import { TechnicianJob } from "@/types/technician";

// Process offline operations when back online
export const syncOfflineOperations = async (
  operations: OfflineOperation[],
  fetchJobs: () => Promise<void>
): Promise<void> => {
  if (!navigator.onLine || operations.length === 0) return;

  for (const operation of operations) {
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
          // This would be implemented when adding the actual time log functionality
          break;
        
        case 'photo_upload':
          // Would need to retrieve locally saved photo and upload
          // This would be implemented when adding the actual photo upload functionality
          break;
        
        case 'parts_request':
          // Save parts request to database
          // This would be implemented when adding the actual parts request functionality
          break;
      }
    } catch (error) {
      console.error(`Error syncing operation ${operation.id}:`, error);
    }
  }
  
  // Refresh jobs after syncing
  await fetchJobs();
};

// Create an offline operation
export const createOfflineOperation = <T>(type: OfflineOperation['type'], data: T): OfflineOperation => {
  return {
    id: uuidv4(),
    type,
    data,
    timestamp: new Date().toISOString()
  };
};

// Update the local jobs state
export const updateJobState = (
  jobs: TechnicianJob[],
  jobId: string,
  updates: Partial<TechnicianJob>
): TechnicianJob[] => {
  return jobs.map(job => 
    job.id === jobId 
      ? { ...job, ...updates } 
      : job
  );
};
