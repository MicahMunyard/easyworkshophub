
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TechnicianJob, JobStatus } from "@/types/technician";
import { 
  ChevronRight, 
  Clock, 
  Timer, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

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
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between mt-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found in this category</p>
      </div>
    );
  }
  
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case 'inProgress':
      case 'working':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive" className="ml-2">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="ml-2">Medium</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <Card key={job.id} className={`overflow-hidden hover:shadow-md transition-all ${job.isActive ? 'border-primary border-2' : ''}`}>
          <CardContent className="p-0">
            <div 
              className="p-4 cursor-pointer" 
              onClick={() => onSelectJob(job.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.vehicle}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(job.status)}
                    {getPriorityBadge(job.priority)}
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
                  onClick={() => onUpdateStatus(job.id, 'accepted')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-none py-3 h-auto text-red-600"
                  onClick={() => onUpdateStatus(job.id, 'declined')}
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
                  onClick={() => onUpdateStatus(job.id, 'inProgress')}
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
                  onClick={() => onToggleTimer(job.id)}
                >
                  <Timer className={`h-4 w-4 mr-2 ${activeJobId === job.id && isTimerRunning ? "animate-pulse" : ""}`} />
                  {activeJobId === job.id && isTimerRunning ? "Stop Timer" : "Start Timer"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobList;
