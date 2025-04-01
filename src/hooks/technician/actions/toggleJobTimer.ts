
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob, TimeLog } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { createOfflineOperation, updateJobState } from "../utils/offlineUtils";
import { OfflineOperation } from "../types/offlineTypes";

export const useToggleJobTimer = (
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>,
  setOfflineOperations: React.Dispatch<React.SetStateAction<OfflineOperation[]>>,
  isTimerRunning: boolean,
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>,
  activeJobId: string | null,
  setActiveJobId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { toast } = useToast();

  const toggleJobTimer = async (jobId: string): Promise<void> => {
    // If a timer is already running for another job, stop it first
    if (isTimerRunning && activeJobId && activeJobId !== jobId) {
      // Stop the current timer
      // Code to stop timer for previous job would go here
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
        
        const offlineOp = createOfflineOperation('time_log', timeLog);
        setOfflineOperations(prev => [...prev, offlineOp]);
        
        toast({
          title: "Time logged (offline mode)",
          description: "Time record will sync when you're back online.",
        });
        return;
      }

      // Log time to database
      // Code to save time log would go here
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
  };

  return toggleJobTimer;
};
