
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobType } from "@/types/job";

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const addJob = async (newJob: JobType) => {
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
      
      toast({
        title: "Job Created",
        description: `Job ${newJob.id} has been created successfully.`
      });
      
      return true;
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
      return false;
    } finally {
      fetchJobs(); // Refresh the jobs list
    }
  };

  const updateJob = async (updatedJob: JobType) => {
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
      
      toast({
        title: "Job Updated",
        description: `Job ${updatedJob.id} has been updated successfully.`
      });
      
      return true;
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
      return false;
    } finally {
      fetchJobs(); // Refresh the jobs list
    }
  };

  const reassignJob = async (job: JobType, newTechnician: string) => {
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
      
      toast({
        title: "Job Reassigned",
        description: `Job ${job.id} has been reassigned to ${newTechnician}.`
      });
      
      return true;
    } catch (error) {
      console.error("Error reassigning job:", error);
      toast({
        title: "Error",
        description: "Failed to reassign job",
        variant: "destructive"
      });
      return false;
    } finally {
      fetchJobs(); // Refresh the jobs list
    }
  };

  const cancelJob = async (job: JobType) => {
    try {
      // Update job status to 'cancelled' in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'cancelled'
        })
        .eq('id', job.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Job Cancelled",
        description: `Job ${job.id} has been cancelled.`,
        variant: "destructive"
      });
      
      return true;
    } catch (error) {
      console.error("Error cancelling job:", error);
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive"
      });
      return false;
    } finally {
      fetchJobs(); // Refresh the jobs list
    }
  };

  const getFilteredJobs = () => {
    return jobs.filter(job => {
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
  };

  return {
    jobs,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedJob,
    setSelectedJob,
    filteredJobs: getFilteredJobs(),
    fetchJobs,
    addJob,
    updateJob,
    reassignJob,
    cancelJob
  };
};
