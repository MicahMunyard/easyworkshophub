
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobType } from "@/types/job";
import { Calendar, Clock, Car, Wrench, User, ArrowUpRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobType | null;
  onEdit: (job: JobType) => void;
}

const jobStatuses = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  inProgress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Completed", icon: ArrowUpRight, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
};

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job, onEdit }) => {
  if (!job) return null;

  const StatusIcon = jobStatuses[job.status].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Job Details</span>
            <Badge variant="outline" className="ml-2">{job.id}</Badge>
          </DialogTitle>
          <DialogDescription>
            View the complete details of this job.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{job.service}</h3>
            <Badge variant="outline" className={cn(
              "gap-1 font-normal",
              jobStatuses[job.status].color
            )}>
              <StatusIcon className="h-3 w-3" />
              {jobStatuses[job.status].label}
            </Badge>
          </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5" /> Service
              </div>
              <div className="font-medium">{job.service}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Assigned To
              </div>
              <div className="font-medium">{job.assignedTo}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Date
              </div>
              <div className="font-medium">{job.date}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Time Estimate
              </div>
              <div className="font-medium">{job.timeEstimate}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Priority</div>
            <div>
              <Badge variant="outline" className={cn(
                job.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                job.priority === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}>
                {job.priority}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(job)}>
            Edit Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
