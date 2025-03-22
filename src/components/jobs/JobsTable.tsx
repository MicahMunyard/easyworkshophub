
import React from "react";
import { 
  Search, 
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit2,
  UserPlus,
  FileText,
  XCircle
} from "lucide-react";
import { 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { JobType } from "@/types/job";
import { jobStatuses } from "./jobUtils";

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

const JobsTable = ({ 
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
}: JobsTableProps) => {
  return (
    <>
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Workshop Jobs</CardTitle>
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search jobs..."
              className="w-full rounded-md border border-input bg-transparent pl-8 pr-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="border rounded-md divide-y">
          <div className="bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground grid grid-cols-12 gap-4">
            <div className="col-span-4 md:col-span-3">Job & Customer</div>
            <div className="hidden md:block md:col-span-3">Vehicle & Service</div>
            <div className="col-span-3 md:col-span-2">Status</div>
            <div className="col-span-3 md:col-span-2">Assigned To</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {isLoading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No jobs found matching your criteria.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const StatusIcon = jobStatuses[job.status].icon;
              return (
                <div key={job.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50">
                  <div className="col-span-4 md:col-span-3">
                    <div className="font-medium">{job.id}</div>
                    <div className="text-sm text-muted-foreground">{job.customer}</div>
                  </div>
                  <div className="hidden md:block md:col-span-3">
                    <div className="text-sm">{job.vehicle}</div>
                    <div className="text-sm text-muted-foreground">{job.service}</div>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Badge variant="outline" className={cn(
                      "gap-1 font-normal text-xs",
                      jobStatuses[job.status].color
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      {jobStatuses[job.status].label}
                    </Badge>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-sm">
                    {job.assignedTo}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onViewDetails(job)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditJob(job)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReassignJob(job)}>
                          <UserPlus className="h-4 w-4 mr-2" /> Reassign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" /> Create Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onCancelJob(job)}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Cancel Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </>
  );
};

export default JobsTable;
