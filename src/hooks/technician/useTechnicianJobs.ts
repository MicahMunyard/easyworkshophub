
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicianJob } from "@/types/technician";
import { OfflineOperation } from "./types/offlineTypes";
import { syncOfflineOperations } from "./utils/offlineUtils";
import { useFetchJobs } from "./actions/fetchJobs";
import { useUpdateJobStatus } from "./actions/updateJobStatus";
import { useToggleJobTimer } from "./actions/toggleJobTimer";
import { useUploadJobPhoto } from "./actions/uploadJobPhoto";
import { useRequestJobParts } from "./actions/requestJobParts";

export const useTechnicianJobs = (technicianId: string | null) => {
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [offlineOperations, setOfflineOperations] = useState<OfflineOperation[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const { user } = useAuth();

  // Initialize the fetch jobs action
  const fetchJobs = useFetchJobs(technicianId, user?.id || null, setIsLoading, setJobs);
  
  // Initialize job actions
  const updateJobStatus = useUpdateJobStatus(setJobs, setOfflineOperations);
  const toggleJobTimer = useToggleJobTimer(
    setJobs, 
    setOfflineOperations, 
    isTimerRunning, 
    setIsTimerRunning, 
    activeJobId, 
    setActiveJobId
  );
  const uploadJobPhoto = useUploadJobPhoto(setJobs, setOfflineOperations);
  const requestJobParts = useRequestJobParts(setJobs, setOfflineOperations);

  // Sync offline operations when coming back online
  useEffect(() => {
    const syncOfflineData = async () => {
      await syncOfflineOperations(offlineOperations, fetchJobs);
      if (navigator.onLine && offlineOperations.length > 0) {
        setOfflineOperations([]);
      }
    };
    
    syncOfflineData();
  }, [navigator.onLine, offlineOperations.length, fetchJobs]);

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
