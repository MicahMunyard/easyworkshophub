
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer } from "lucide-react";
import { TechnicianJob } from "@/types/technician";

interface JobHeaderProps {
  job: TechnicianJob;
  isTimerRunning: boolean;
  onBack: () => void;
  onToggleTimer: (jobId: string) => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({ 
  job, 
  isTimerRunning, 
  onBack, 
  onToggleTimer 
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="ghost" 
        className="p-0 h-auto gap-1"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Button>
      {(job.status === 'inProgress' || job.status === 'working') && (
        <Button 
          variant={isTimerRunning ? "default" : "outline"}
          className={`gap-1 ${isTimerRunning ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200" : ""}`}
          onClick={() => onToggleTimer(job.id)}
        >
          <Timer className={`h-4 w-4 ${isTimerRunning ? "animate-pulse" : ""}`} />
          {isTimerRunning ? "Stop Timer" : "Start Timer"}
        </Button>
      )}
    </div>
  );
};

export default JobHeader;
