
import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, UserCheck2, X } from "lucide-react";
import { JobType } from "@/types/job";

interface JobActionsProps {
  job: JobType;
  onViewDetails: (job: JobType) => void;
  onEditJob: (job: JobType) => void;
  onReassignJob: (job: JobType) => void;
  onCancelJob: (job: JobType) => void;
}

const JobActions: React.FC<JobActionsProps> = ({
  job,
  onViewDetails,
  onEditJob,
  onReassignJob,
  onCancelJob
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewDetails(job)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditJob(job)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Job
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onReassignJob(job)}>
          <UserCheck2 className="mr-2 h-4 w-4" />
          Reassign
        </DropdownMenuItem>
        {job.status !== 'cancelled' && (
          <DropdownMenuItem onClick={() => onCancelJob(job)} className="text-red-600">
            <X className="mr-2 h-4 w-4" />
            Cancel Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default JobActions;
