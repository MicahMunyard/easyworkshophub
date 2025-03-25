
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobType } from "@/types/job";
import JobsList from "./JobsList";

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

export default JobsTable;
