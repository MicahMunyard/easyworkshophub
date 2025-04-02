
import React, { useState } from "react";
import { TechnicianJob, JobStatus } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import JobHeader from "./job-detail/JobHeader";
import JobInfoCard from "./job-detail/JobInfoCard";
import JobTabs from "./job-detail/JobTabs";
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
  
  // Add debugging to see job data
  console.log("JobDetailView - Current job data:", job);
  
  const handleComplete = () => {
    onUpdateStatus(job.id, 'completed');
    setIsCompleteDialogOpen(false);
    toast({
      title: "Job completed",
      description: "The job has been marked as complete.",
    });
  };

  return (
    <>
      <div className="space-y-6">
        <JobHeader 
          job={job} 
          isTimerRunning={isTimerRunning} 
          onBack={onBack} 
          onToggleTimer={onToggleTimer} 
        />
        
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
