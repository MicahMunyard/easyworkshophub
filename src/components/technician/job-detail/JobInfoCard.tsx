
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Car, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechnicianJob, JobStatus } from "@/types/technician";
import StatusBadge from "./StatusBadge";

interface JobInfoCardProps {
  job: TechnicianJob;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
}

const JobInfoCard: React.FC<JobInfoCardProps> = ({ job, onUpdateStatus }) => {
  const getNextStepButton = () => {
    switch (job.status) {
      case 'pending':
        return (
          <Button 
            className="gap-2"
            onClick={() => onUpdateStatus(job.id, 'accepted')}
          >
            <CheckCircle2 className="h-4 w-4" />
            Accept Job
          </Button>
        );
      case 'accepted':
        return (
          <Button 
            className="gap-2"
            onClick={() => onUpdateStatus(job.id, 'inProgress')}
          >
            <Timer className="h-4 w-4" />
            Start Work
          </Button>
        );
      case 'inProgress':
      case 'working':
        return (
          <Button 
            className="gap-2"
            onClick={() => setIsCompleteDialogOpen(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Job
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Job #{job.id}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Customer
            </div>
            <div className="font-medium">{job.customer}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> Vehicle
            </div>
            <div className="font-medium">{job.vehicle}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Scheduled
            </div>
            <div className="font-medium">{job.scheduledFor || 'Not scheduled'}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Estimated Time
            </div>
            <div className="font-medium">{job.estimatedTime || 'Not specified'}</div>
          </div>
        </div>
        
        {job.description && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-1">Description</div>
            <p>{job.description}</p>
          </div>
        )}
        
        {job.status !== 'completed' && job.status !== 'cancelled' && job.status !== 'declined' && (
          <div className="mt-6 flex justify-end">
            {getNextStepButton()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Fix the missing import
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default JobInfoCard;
