
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Use a ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  // Use a ref to track if a fetch is in progress
  const fetchInProgress = useRef(false);

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

  // Memoized refresh function to prevent unnecessary recreations
  const refreshJobs = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) {
      console.log("Refresh skipped - fetch already in progress");
      return;
    }
    
    console.log("Starting job refresh");
    fetchInProgress.current = true;
    await fetchJobs();
    fetchInProgress.current = false;
    initialFetchDone.current = true;
    console.log("Job refresh completed, jobs count:", jobs.length);
  }, [fetchJobs, jobs.length]);

  // Sync offline operations when coming back online
  useEffect(() => {
    const syncOfflineData = async () => {
      if (navigator.onLine && offlineOperations.length > 0) {
        await syncOfflineOperations(offlineOperations, refreshJobs);
        setOfflineOperations([]);
      }
    };
    
    syncOfflineData();
  }, [navigator.onLine, offlineOperations.length, refreshJobs]);

  // Initial data fetch - only run once
  useEffect(() => {
    if (technicianId && !initialFetchDone.current) {
      console.log("Initial job fetch triggered");
      refreshJobs();
    }
  }, [technicianId, refreshJobs]);

  return {
    jobs,
    isLoading,
    activeJobId,
    isTimerRunning,
    updateJobStatus,
    toggleJobTimer,
    uploadJobPhoto,
    requestJobParts,
    refreshJobs,
    offlinePendingCount: offlineOperations.length
  };
};
