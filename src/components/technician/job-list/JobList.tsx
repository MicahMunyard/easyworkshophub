
import React, { useCallback } from "react";
import { TechnicianJob, JobStatus } from "@/types/technician";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: TechnicianJob[];
  isLoading: boolean;
  onSelectJob: (jobId: string) => void;
  onUpdateStatus?: (jobId: string, status: JobStatus) => void;
  activeJobId?: string | null;
  isTimerRunning?: boolean;
  onToggleTimer?: (jobId: string) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  isLoading,
  onSelectJob,
  onUpdateStatus,
  activeJobId,
  isTimerRunning,
  onToggleTimer
}) => {
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!jobs || jobs.length === 0) {
    return <EmptyState />;
  }
  
  console.log("JobList - Rendering jobs:", jobs);
  
  const handleJobSelect = useCallback((jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Selecting job with ID:", jobId);
    onSelectJob(jobId);
  }, [onSelectJob]);
  
  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onSelectJob={handleJobSelect}
          onUpdateStatus={onUpdateStatus}
          activeJobId={activeJobId}
          isTimerRunning={isTimerRunning}
          onToggleTimer={onToggleTimer}
        />
      ))}
    </div>
  );
};

export default JobList;
