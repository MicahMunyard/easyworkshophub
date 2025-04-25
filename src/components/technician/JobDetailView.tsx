import React, { useState, useEffect } from "react";
import { TechnicianJob, JobStatus } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import JobHeader from "./job-detail/JobHeader";
import JobInfoCard from "./job-detail/JobInfoCard";
import JobTabs from "./job-detail/JobTabs";
import TimeTracker from "./TimeTracker";
import CompleteJobDialog from "./job-detail/CompleteJobDialog";

interface JobDetailViewProps {
  job: TechnicianJob;
  isTimerRunning: boolean;
  onBack: () => void;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
  onToggleTimer: (jobId: string) => void;
  onUploadPhoto: (jobId: string, file: File) => void;
  onRequestParts: (jobId: string, parts: { name: string, quantity: number }[]) => void;
}

const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  isTimerRunning,
  onBack,
  onUpdateStatus,
  onToggleTimer,
  onUploadPhoto,
  onRequestParts
}) => {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  const { toast } = useToast();
  
  // Add detailed debugging to track job data
  useEffect(() => {
    console.log("JobDetailView - Current job data:", job);
    console.log("JobDetailView - Photos:", job.photos || []);
    console.log("JobDetailView - Parts:", job.partsRequested || []);
    console.log("JobDetailView - Notes:", job.notes || []);
  }, [job]);
  
  const handleComplete = () => {
    onUpdateStatus(job.id, 'completed');
    setIsCompleteDialogOpen(false);
    toast({
      title: "Job completed",
      description: "The job has been marked as complete.",
    });
  };

  // If job data is invalid or incomplete, show a fallback message
  if (!job || !job.id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button 
            className="text-sm flex items-center gap-1" 
            onClick={onBack}
          >
            ← Back to jobs
          </button>
        </div>
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium">Job data is unavailable</h3>
          <p className="mt-2 text-muted-foreground">
            There was a problem loading this job. Please go back and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <JobHeader 
          job={job} 
          isTimerRunning={isTimerRunning} 
          onBack={onBack} 
          onToggleTimer={onToggleTimer} 
        />
        
        <div className="flex items-center justify-between">
          <JobInfoCard 
            job={job} 
            onUpdateStatus={(jobId, status) => {
              if (status === 'completed') {
                setIsCompleteDialogOpen(true);
              } else {
                onUpdateStatus(jobId, status);
              }
            }} 
          />
          {(job.status === 'inProgress' || job.status === 'working') && (
            <TimeTracker jobId={job.id} technicianId={job.assignedTo} />
          )}
        </div>
        
        <JobTabs 
          jobId={job.id}
          photos={job.photos || []}
          partsRequested={job.partsRequested || []}
          notes={job.notes || []}
          onUploadPhoto={onUploadPhoto}
          onRequestParts={onRequestParts}
        />
      </div>
      
      <CompleteJobDialog 
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        completeNotes={completeNotes}
        setCompleteNotes={setCompleteNotes}
        onComplete={handleComplete}
      />
    </>
  );
};

export default JobDetailView;
