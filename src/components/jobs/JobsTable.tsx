
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, UserCheck2, X, Clock } from "lucide-react";
import { JobType } from "@/types/job";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface JobsTableProps {
  filteredJobs: JobType[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  onViewDetails: (job: JobType) => void;
  onEditJob: (job: JobType) => void;
  onReassignJob: (job: JobType) => void;
  onCancelJob: (job: JobType) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({
  filteredJobs,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  isLoading,
  onViewDetails,
  onEditJob,
  onReassignJob,
  onCancelJob
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'inProgress':
      case 'working': return 'bg-blue-200 text-blue-800';
      case 'completed': return 'bg-green-200 text-green-800';
      case 'cancelled': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-200 text-red-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Check if the date is in ISO format or YYYY-MM-DD format
      const date = dateString.includes('T') 
        ? new Date(dateString) 
        : new Date(dateString + 'T00:00:00');
        
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Return original string if format fails
    }
  };

  const isBookingJob = (jobId: string) => {
    return jobId.startsWith('BKG-');
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          <JobsList 
            jobs={filteredJobs}
            isLoading={isLoading}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
            isBookingJob={isBookingJob}
            onViewDetails={onViewDetails}
            onEditJob={onEditJob}
            onReassignJob={onReassignJob}
            onCancelJob={onCancelJob}
          />
        </TabsContent>

        <TabsContent value="pending" className="pt-4">
          <JobsList 
            jobs={filteredJobs.filter(job => job.status === 'pending')}
            isLoading={isLoading}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
            isBookingJob={isBookingJob}
            onViewDetails={onViewDetails}
            onEditJob={onEditJob}
            onReassignJob={onReassignJob}
            onCancelJob={onCancelJob}
          />
        </TabsContent>

        <TabsContent value="in-progress" className="pt-4">
          <JobsList 
            jobs={filteredJobs.filter(job => ['inProgress', 'working'].includes(job.status))}
            isLoading={isLoading}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor} 
            formatDate={formatDate}
            isBookingJob={isBookingJob}
            onViewDetails={onViewDetails}
            onEditJob={onEditJob}
            onReassignJob={onReassignJob}
            onCancelJob={onCancelJob}
          />
        </TabsContent>

        <TabsContent value="completed" className="pt-4">
          <JobsList 
            jobs={filteredJobs.filter(job => job.status === 'completed')}
            isLoading={isLoading}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
            isBookingJob={isBookingJob}
            onViewDetails={onViewDetails}
            onEditJob={onEditJob}
            onReassignJob={onReassignJob}
            onCancelJob={onCancelJob}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface JobsListProps {
  jobs: JobType[];
  isLoading: boolean;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  formatDate: (dateString: string) => string;
  isBookingJob: (jobId: string) => boolean;
  onViewDetails: (job: JobType) => void;
  onEditJob: (job: JobType) => void;
  onReassignJob: (job: JobType) => void;
  onCancelJob: (job: JobType) => void;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  isLoading,
  getStatusColor,
  getPriorityColor,
  formatDate,
  isBookingJob,
  onViewDetails,
  onEditJob,
  onReassignJob,
  onCancelJob
}) => {
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
          <TableHead>Time</TableHead> {/* Add Time column */}
          <TableHead>Priority</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id} className={isBookingJob(job.id) ? "bg-blue-50" : ""}>
            <TableCell className="font-medium">
              {job.id}
              {isBookingJob(job.id) && (
                <Badge variant="outline" className="ml-2 bg-blue-100">Booking</Badge>
              )}
            </TableCell>
            <TableCell>{job.customer}</TableCell>
            <TableCell>{job.vehicle}</TableCell>
            <TableCell>{job.service}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(job.status)}>
                {job.status === 'inProgress' ? 'In Progress' : 
                 job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{job.assignedTo}</TableCell>
            <TableCell>{formatDate(job.date)}</TableCell>
            <TableCell>{job.time || 'Not specified'}</TableCell> {/* Display time */}
            <TableCell>
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default JobsTable;
