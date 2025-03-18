import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  ArrowUpDown,
  X,
  Eye,
  Edit2,
  UserPlus,
  FileText,
  XCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { JobType } from "@/types/job";
import { useToast } from "@/hooks/use-toast";
import NewJobModal from "@/components/NewJobModal";
import JobDetailsModal from "@/components/JobDetailsModal";
import EditJobModal from "@/components/EditJobModal";
import ReassignJobModal from "@/components/ReassignJobModal";

const jobStatuses = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  inProgress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
};

const dummyJobs: JobType[] = [
  {
    id: "JOB-1234",
    customer: "John Smith",
    vehicle: "2018 Toyota Camry",
    service: "Oil Change & Tire Rotation",
    status: "pending",
    assignedTo: "Mike Johnson",
    date: "2023-06-15",
    timeEstimate: "1 hour",
    priority: "Medium"
  },
  {
    id: "JOB-1235",
    customer: "Emma Wilson",
    vehicle: "2021 Tesla Model 3",
    service: "Diagnostic & Software Update",
    status: "inProgress",
    assignedTo: "Sarah Thomas",
    date: "2023-06-15",
    timeEstimate: "2 hours",
    priority: "High"
  },
  {
    id: "JOB-1236",
    customer: "Michael Brown",
    vehicle: "2019 Ford F-150",
    service: "Brake Replacement",
    status: "inProgress",
    assignedTo: "Mike Johnson",
    date: "2023-06-15",
    timeEstimate: "3 hours",
    priority: "High"
  },
  {
    id: "JOB-1237",
    customer: "Jessica Lee",
    vehicle: "2020 Honda Civic",
    service: "Wheel Alignment",
    status: "completed",
    assignedTo: "Alex Rodriguez",
    date: "2023-06-14",
    timeEstimate: "1 hour",
    priority: "Medium"
  },
  {
    id: "JOB-1238",
    customer: "Robert Davis",
    vehicle: "2017 BMW X5",
    service: "AC Repair",
    status: "completed",
    assignedTo: "Sarah Thomas",
    date: "2023-06-14",
    timeEstimate: "4 hours",
    priority: "Medium"
  }
];

const Jobs = () => {
  const [jobs, setJobs] = useState<JobType[]>(dummyJobs);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const handleAddNewJob = (newJob: JobType) => {
    setJobs([...jobs, newJob]);
    setIsNewJobModalOpen(false);
    
    toast({
      title: "Job Created",
      description: `Job ${newJob.id} has been created successfully.`
    });
  };

  const handleViewDetails = (job: JobType) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const handleEditJob = (job: JobType) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateJob = (updatedJob: JobType) => {
    const updatedJobs = jobs.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    );
    setJobs(updatedJobs);
    setIsEditModalOpen(false);
    
    toast({
      title: "Job Updated",
      description: `Job ${updatedJob.id} has been updated successfully.`
    });
  };

  const handleReassignJob = (job: JobType) => {
    setSelectedJob(job);
    setIsReassignModalOpen(true);
  };

  const handleReassignConfirm = (job: JobType, newTechnician: string) => {
    const updatedJob = { ...job, assignedTo: newTechnician };
    const updatedJobs = jobs.map(j => 
      j.id === job.id ? updatedJob : j
    );
    setJobs(updatedJobs);
    setIsReassignModalOpen(false);
    
    toast({
      title: "Job Reassigned",
      description: `Job ${job.id} has been reassigned to ${newTechnician}.`
    });
  };

  const handleCancelJobClick = (job: JobType) => {
    setSelectedJob(job);
    setIsCancelDialogOpen(true);
  };

  const handleCancelJobConfirm = () => {
    if (selectedJob) {
      const updatedJobs = jobs.filter(job => job.id !== selectedJob.id);
      setJobs(updatedJobs);
      setIsCancelDialogOpen(false);
      
      toast({
        title: "Job Cancelled",
        description: `Job ${selectedJob.id} has been cancelled.`,
        variant: "destructive"
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && (job.status === "pending" || job.status === "inProgress");
    if (activeTab === "completed") return matchesSearch && job.status === "completed";
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Track, assign and manage workshop jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="h-9"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button 
            className="h-9"
            onClick={() => setIsNewJobModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> New Job
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-muted/30 p-4 rounded-md border animate-fadeIn">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search jobs by ID, customer, vehicle, service..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full">
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
              {filteredJobs.length === 0 ? (
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
                            <DropdownMenuItem onClick={() => handleViewDetails(job)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditJob(job)}>
                              <Edit2 className="h-4 w-4 mr-2" /> Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReassignJob(job)}>
                              <UserPlus className="h-4 w-4 mr-2" /> Reassign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" /> Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelJobClick(job)}
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
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Job Stats</CardTitle>
            <CardDescription>Today's workshop overview</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold">8</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">12</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">5</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Technician Workload</CardTitle>
            <CardDescription>Active jobs by technician</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mike Johnson</span>
                <span>6 jobs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sarah Thomas</span>
                <span>4 jobs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alex Rodriguez</span>
                <span>5 jobs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Lisa Chen</span>
                <span>3 jobs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-2">
            <Button variant="outline" className="justify-start w-full">
              <Plus className="h-4 w-4 mr-2" /> Create New Job
            </Button>
            <Button variant="outline" className="justify-start w-full">
              <Clock className="h-4 w-4 mr-2" /> View Job Schedule
            </Button>
            <Button variant="outline" className="justify-start w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Job Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onSave={handleAddNewJob}
      />

      <JobDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        job={selectedJob}
        onEdit={handleEditJob}
      />

      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        job={selectedJob}
        onSave={handleUpdateJob}
      />

      <ReassignJobModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        job={selectedJob}
        onReassign={handleReassignConfirm}
      />

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this job? This action cannot be undone.
              {selectedJob && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedJob.id}</p>
                  <p className="text-sm">{selectedJob.customer} - {selectedJob.service}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Job</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelJobConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Jobs;
