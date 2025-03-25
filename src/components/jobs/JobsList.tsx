
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobType } from "@/types/job";
import { StatusBadge, PriorityBadge } from "./JobBadges";
import { formatDate } from "./DateUtils";
import JobActions from "./JobActions";

interface JobsListProps {
  jobs: JobType[];
  isLoading: boolean;
  onViewDetails: (job: JobType) => void;
  onEditJob: (job: JobType) => void;
  onReassignJob: (job: JobType) => void;
  onCancelJob: (job: JobType) => void;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  isLoading,
  onViewDetails,
  onEditJob,
  onReassignJob,
  onCancelJob
}) => {
  const isBookingJob = (jobId: string) => {
    return jobId.startsWith('BKG-');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No jobs found for the selected filter.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow 
            key={job.id} 
            className={`bg-workshop-carbon text-white transition-all duration-200 ${isBookingJob(job.id) ? "bg-opacity-90 border-l-4 border-l-workshop-blue" : ""} hover:border-workshop-red hover:border-2`}
          >
            <TableCell className="font-medium">
              {job.id}
              {isBookingJob(job.id) && (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-black">Booking</Badge>
              )}
            </TableCell>
            <TableCell>{job.customer}</TableCell>
            <TableCell>{job.vehicle}</TableCell>
            <TableCell>{job.service}</TableCell>
            <TableCell>
              <StatusBadge status={job.status} />
            </TableCell>
            <TableCell>{job.assignedTo}</TableCell>
            <TableCell>{formatDate(job.date)}</TableCell>
            <TableCell>{job.time || 'Not specified'}</TableCell>
            <TableCell>
              <PriorityBadge priority={job.priority} />
            </TableCell>
            <TableCell className="text-right">
              <JobActions 
                job={job}
                onViewDetails={onViewDetails}
                onEditJob={onEditJob}
                onReassignJob={onReassignJob}
                onCancelJob={onCancelJob}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default JobsList;
