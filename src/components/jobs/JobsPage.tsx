
import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  X
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobType } from "@/types/job";

// Importing the components we'll create
import JobsHeader from "./JobsHeader";
import JobsFilter from "./JobsFilter";
import JobsTable from "./JobsTable";
import JobsStats from "./JobsStats";
import QuickActions from "./QuickActions";
import NewJobModal from "./NewJobModal";
import JobDetailsModal from "./JobDetailsModal";
import EditJobModal from "./EditJobModal";
import ReassignJobModal from "./ReassignJobModal";
import CancelJobDialog from "./CancelJobDialog";

const JobsPage = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform to match JobType interface
        const transformedJobs = data.map(job => ({
          id: job.id,
          customer: job.customer,
          vehicle: job.vehicle,
          service: job.service,
          status: job.status,
          assignedTo: job.assigned_to,
          date: job.date,
          timeEstimate: job.time_estimate,
          priority: job.priority
        })) as JobType[];
        
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddNewJob = async (newJob: JobType) => {
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          id: newJob.id,
          customer: newJob.customer,
          vehicle: newJob.vehicle,
          service: newJob.service,
          status: newJob.status,
          assigned_to: newJob.assignedTo,
          date: newJob.date,
          time_estimate: newJob.timeEstimate,
          priority: newJob.priority
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      setIsNewJobModalOpen(false);
      fetchJobs(); // Refresh the jobs list
      
      toast({
        title: "Job Created",
        description: `Job ${newJob.id} has been created successfully.`
      });
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
    }
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

  const handleUpdateJob = async (updatedJob: JobType) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({
          customer: updatedJob.customer,
          vehicle: updatedJob.vehicle,
          service: updatedJob.service,
          status: updatedJob.status,
          assigned_to: updatedJob.assignedTo,
          date: updatedJob.date,
          time_estimate: updatedJob.timeEstimate,
          priority: updatedJob.priority
        })
        .eq('id', updatedJob.id);
      
      if (error) {
        throw error;
      }
      
      setIsEditModalOpen(false);
      fetchJobs(); // Refresh the jobs list
      
      toast({
        title: "Job Updated",
        description: `Job ${updatedJob.id} has been updated successfully.`
      });
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
    }
  };

  const handleReassignJob = (job: JobType) => {
    setSelectedJob(job);
    setIsReassignModalOpen(true);
  };

  const handleReassignConfirm = async (job: JobType, newTechnician: string) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({
          assigned_to: newTechnician
        })
        .eq('id', job.id);
      
      if (error) {
        throw error;
      }
      
      setIsReassignModalOpen(false);
      fetchJobs(); // Refresh the jobs list
      
      toast({
        title: "Job Reassigned",
        description: `Job ${job.id} has been reassigned to ${newTechnician}.`
      });
    } catch (error) {
      console.error("Error reassigning job:", error);
      toast({
        title: "Error",
        description: "Failed to reassign job",
        variant: "destructive"
      });
    }
  };

  const handleCancelJobClick = (job: JobType) => {
    setSelectedJob(job);
    setIsCancelDialogOpen(true);
  };

  const handleCancelJobConfirm = async () => {
    if (selectedJob) {
      try {
        // Update job status to 'cancelled' in Supabase
        const { error } = await supabase
          .from('jobs')
          .update({
            status: 'cancelled'
          })
          .eq('id', selectedJob.id);
        
        if (error) {
          throw error;
        }
        
        setIsCancelDialogOpen(false);
        fetchJobs(); // Refresh the jobs list
        
        toast({
          title: "Job Cancelled",
          description: `Job ${selectedJob.id} has been cancelled.`,
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error cancelling job:", error);
        toast({
          title: "Error",
          description: "Failed to cancel job",
          variant: "destructive"
        });
      }
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
      <JobsHeader 
        onNewJobClick={() => setIsNewJobModalOpen(true)}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
      />

      {isFilterOpen && (
        <JobsFilter 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full">
          <JobsTable 
            filteredJobs={filteredJobs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onEditJob={handleEditJob}
            onReassignJob={handleReassignJob}
            onCancelJob={handleCancelJobClick}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <JobsStats />
        <QuickActions />
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

      <CancelJobDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        job={selectedJob}
        onConfirm={handleCancelJobConfirm}
      />
    </div>
  );
};

export default JobsPage;
