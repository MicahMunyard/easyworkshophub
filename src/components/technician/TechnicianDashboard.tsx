
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicianProfile } from "@/types/technician";
import { useTechnicianJobs } from "@/hooks/technician/useTechnicianJobs";
import JobList from "@/components/technician/JobList";
import TechnicianStats from "@/components/technician/TechnicianStats";
import JobDetailView from "@/components/technician/JobDetailView";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicianDashboardProps {
  technicianProfile: TechnicianProfile | null;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ 
  technicianProfile 
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    jobs,
    isLoading,
    activeJobId,
    isTimerRunning,
    updateJobStatus,
    toggleJobTimer,
    uploadJobPhoto,
    requestJobParts,
    refreshJobs,
    offlinePendingCount
  } = useTechnicianJobs(technicianProfile?.id || null);
  
  // Debug log for jobs - only log when jobs actually change
  useEffect(() => {
    console.log("TechnicianDashboard - Jobs updated:", jobs);
    console.log("TechnicianDashboard - Pending jobs count:", pendingJobs.length);
    console.log("TechnicianDashboard - Active jobs count:", activeJobs.length);
    console.log("TechnicianDashboard - Completed jobs count:", completedJobs.length);
  }, [jobs]);
  
  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple refreshes
    
    setRefreshing(true);
    await refreshJobs();
    setTimeout(() => setRefreshing(false), 500); // Ensure animation plays for at least 500ms
  };
  
  // Force refresh on initial load - but only once
  useEffect(() => {
    let mounted = true;
    
    if (technicianProfile?.id) {
      refreshJobs().then(() => {
        if (mounted) {
          console.log("Initial job refresh completed");
        }
      });
    }
    
    return () => {
      mounted = false;
    };
  }, [technicianProfile?.id, refreshJobs]);
  
  // Memoize the filtered jobs to prevent recomputation on every render
  const pendingJobs = useMemo(() => 
    jobs.filter(job => job.status === 'pending' || job.status === 'accepted'),
    [jobs]
  );
  
  const activeJobs = useMemo(() => 
    jobs.filter(job => job.status === 'inProgress' || job.status === 'working'),
    [jobs]
  );
  
  const completedJobs = useMemo(() => 
    jobs.filter(job => job.status === 'completed'),
    [jobs]
  );
  
  // Find the selected job from the jobs array
  const selectedJob = useMemo(() => {
    const job = jobs.find(job => job.id === selectedJobId);
    if (selectedJobId && !job) {
      console.log("Warning: Selected job not found in jobs array:", selectedJobId);
    }
    return job;
  }, [jobs, selectedJobId]);

  // Handler for selecting a job
  const handleSelectJob = useCallback((jobId: string) => {
    console.log("Selecting job with ID:", jobId);
    setSelectedJobId(jobId);
  }, []);
  
  // If jobs are empty and not loading, periodically try to refresh
  useEffect(() => {
    if (!isLoading && jobs.length === 0) {
      const intervalId = setInterval(() => {
        console.log("Auto-refreshing due to empty jobs list");
        refreshJobs();
      }, 10000); // Try every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isLoading, jobs.length, refreshJobs]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {technicianProfile?.name || 'Technician'}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-1"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {offlinePendingCount > 0 ? `Sync (${offlinePendingCount})` : 'Refresh'}
        </Button>
      </div>
      
      <TechnicianStats 
        pendingCount={pendingJobs.length} 
        activeCount={activeJobs.length}
        completedCount={completedJobs.length}
        activeJobTimer={isTimerRunning}
      />
      
      {selectedJob ? (
        <JobDetailView 
          job={selectedJob}
          isTimerRunning={isTimerRunning && activeJobId === selectedJob.id}
          onBack={() => setSelectedJobId(null)}
          onUpdateStatus={updateJobStatus}
          onToggleTimer={toggleJobTimer}
          onUploadPhoto={uploadJobPhoto}
          onRequestParts={requestJobParts}
        />
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="text-base">
              Pending ({pendingJobs.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-base">
              Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-base">
              Completed ({completedJobs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <JobList 
              key="pending-jobs-list"
              jobs={pendingJobs} 
              isLoading={isLoading}
              onSelectJob={handleSelectJob}
              onUpdateStatus={updateJobStatus}
            />
          </TabsContent>
          
          <TabsContent value="active">
            <JobList 
              key="active-jobs-list"
              jobs={activeJobs} 
              isLoading={isLoading}
              onSelectJob={handleSelectJob}
              onUpdateStatus={updateJobStatus}
              activeJobId={activeJobId}
              isTimerRunning={isTimerRunning}
              onToggleTimer={toggleJobTimer}
            />
          </TabsContent>
          
          <TabsContent value="completed">
            <JobList 
              key="completed-jobs-list"
              jobs={completedJobs} 
              isLoading={isLoading}
              onSelectJob={handleSelectJob}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TechnicianDashboard;
