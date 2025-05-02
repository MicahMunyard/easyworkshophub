import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobType } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

export const useJobMutations = (fetchJobs: () => Promise<void>) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences, addNotification } = useNotifications();

  const addJob = async (newJob: JobType) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to create jobs.",
          variant: "destructive"
        });
        return false;
      }

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
          time: newJob.time || null,
          time_estimate: newJob.timeEstimate,
          priority: newJob.priority,
          user_id: user.id
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
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to update jobs.",
          variant: "destructive"
        });
        return false;
      }

      // Get the current job to check if the status is being changed to "completed"
      const { data: currentJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', updatedJob.id)
        .eq('user_id', user.id)
        .single();
      
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
          time: updatedJob.time || null,
          time_estimate: updatedJob.timeEstimate,
          priority: updatedJob.priority
        })
        .eq('id', updatedJob.id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // If the job status is being changed to "completed", create a notification for the admin
      if (
        currentJob && 
        currentJob.status !== "completed" && 
        updatedJob.status === "completed" && 
        preferences.completedJobs
      ) {
        addNotification({
          title: "Job Completed",
          message: `Job ${updatedJob.id} (${updatedJob.service}) has been completed and needs to be finalized.`,
          type: "job_completed",
          priority: "medium",
          actionData: updatedJob
        });
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
      if (!user) {
        toast({
          title: "Authentication Required", 
          description: "You must be logged in to reassign jobs.",
          variant: "destructive"
        });
        return false;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({
          assigned_to: newTechnician
        })
        .eq('id', job.id)
        .eq('user_id', user.id);
      
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
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to cancel jobs.",
          variant: "destructive"
        });
        return false;
      }

      // Update job status to 'cancelled' in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'cancelled'
        })
        .eq('id', job.id)
        .eq('user_id', user.id);
      
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
