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

      // Insert into user_bookings table
      const { data, error } = await supabase
        .from('user_bookings')
        .insert([{
          customer_name: newJob.customer,
          customer_phone: newJob.customerPhone || '',
          customer_email: newJob.customerEmail || null,
          car: newJob.vehicle,
          service: newJob.service,
          status: newJob.status,
          technician_id: newJob.assignedTo || null,
          booking_date: newJob.date,
          booking_time: newJob.time || '09:00',
          duration: newJob.duration || 60,
          time_estimate: newJob.timeEstimate,
          priority: newJob.priority,
          cost: newJob.cost || null,
          notes: newJob.notes || null,
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

      // Get the current booking to check if the status is being changed to "completed"
      const { data: currentJob } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('id', updatedJob.id)
        .eq('user_id', user.id)
        .single();
      
      // Update in user_bookings table
      const { error } = await supabase
        .from('user_bookings')
        .update({
          customer_name: updatedJob.customer,
          customer_phone: updatedJob.customerPhone || '',
          customer_email: updatedJob.customerEmail || null,
          car: updatedJob.vehicle,
          service: updatedJob.service,
          status: updatedJob.status,
          technician_id: updatedJob.assignedTo || null,
          booking_date: updatedJob.date,
          booking_time: updatedJob.time || '09:00',
          duration: updatedJob.duration || 60,
          time_estimate: updatedJob.timeEstimate,
          priority: updatedJob.priority,
          cost: updatedJob.cost || null,
          notes: updatedJob.notes || null
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

      // Update in user_bookings table
      const { error } = await supabase
        .from('user_bookings')
        .update({
          technician_id: newTechnician || null
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

      // Update job status to 'cancelled' in user_bookings table
      const { error } = await supabase
        .from('user_bookings')
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
