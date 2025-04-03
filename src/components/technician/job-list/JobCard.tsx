
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Timer, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TechnicianJob, JobStatus } from "@/types/technician";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

interface JobCardProps {
  job: TechnicianJob;
  onSelectJob: (jobId: string, e: React.MouseEvent) => void;
  onUpdateStatus?: (jobId: string, status: JobStatus) => void;
  activeJobId?: string | null;
  isTimerRunning?: boolean;
  onToggleTimer?: (jobId: string) => void;
}

const JobCard = ({
  job,
  onSelectJob,
  onUpdateStatus,
  activeJobId,
  isTimerRunning,
  onToggleTimer
}: JobCardProps) => {
  return (
    <Card 
      key={job.id} 
      className={`overflow-hidden hover:shadow-md transition-all ${job.isActive ? 'border-primary border-2' : ''}`}
    >
      <CardContent className="p-0">
        <div 
          className="p-4 cursor-pointer" 
          onClick={(e) => onSelectJob(job.id, e)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.vehicle}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={job.status} />
                <PriorityBadge priority={job.priority || 'Medium'} />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between mt-3 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {job.scheduledFor 
                ? formatDistanceToNow(new Date(job.scheduledFor), { addSuffix: true }) 
                : 'No date set'}
            </div>
            <div>
              {job.estimatedTime && (
                <span className="text-muted-foreground">{job.estimatedTime}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        {job.status === 'pending' && onUpdateStatus && (
          <div className="grid grid-cols-2 divide-x border-t">
            <Button 
              variant="ghost" 
              className="rounded-none py-3 h-auto text-green-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent job selection when clicking the button
                onUpdateStatus(job.id, 'accepted');
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button 
              variant="ghost" 
              className="rounded-none py-3 h-auto text-red-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent job selection when clicking the button
                onUpdateStatus(job.id, 'declined');
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
        
        {job.status === 'accepted' && onUpdateStatus && (
          <div className="grid grid-cols-1 border-t">
            <Button 
              variant="ghost" 
              className="rounded-none py-3 h-auto text-blue-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent job selection when clicking the button
                onUpdateStatus(job.id, 'inProgress');
              }}
            >
              <Timer className="h-4 w-4 mr-2" />
              Start Work
            </Button>
          </div>
        )}
        
        {(job.status === 'inProgress' || job.status === 'working') && onToggleTimer && (
          <div className="grid grid-cols-1 border-t">
            <Button 
              variant={activeJobId === job.id && isTimerRunning ? "default" : "ghost"}
              className={`rounded-none py-3 h-auto ${
                activeJobId === job.id && isTimerRunning 
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200" 
                  : "text-blue-600"
              }`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent job selection when clicking the button
                onToggleTimer(job.id);
              }}
            >
              <Timer className={`h-4 w-4 mr-2 ${activeJobId === job.id && isTimerRunning ? "animate-pulse" : ""}`} />
              {activeJobId === job.id && isTimerRunning ? "Stop Timer" : "Start Timer"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
