
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobType } from "@/types/job";

export const useJobMutations = (fetchJobs: () => Promise<void>) => {
  const { toast } = useToast();

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

  return {
    addJob,
    updateJob,
    reassignJob,
    cancelJob
  };
};
