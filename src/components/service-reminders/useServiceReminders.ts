import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminderType } from "./types";
import { useAuth } from "@/contexts/AuthContext";

export const useServiceReminders = (customerId: string) => {
  const [reminders, setReminders] = useState<ServiceReminderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        setReminders([]);
        setIsLoading(false);
        return;
      }

      // Convert string customerId to number for database query
      const numericCustomerId = parseInt(customerId, 10);

      const { data, error } = await supabase
        .from('service_reminders')
        .select('*')
        .eq('customer_id', numericCustomerId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our ServiceReminderType
      const typedReminders: ServiceReminderType[] = data?.map(item => ({
        id: item.id,
        vehicle_info: item.vehicle_info,
        service_type: item.service_type,
        due_date: item.due_date,
        status: (item.status as "pending" | "sent" | "completed" | "cancelled") || "pending",
        customer_id: item.customer_id.toString(), // Convert number to string
        reminder_text: item.reminder_text || undefined,
        notification_method: item.notification_method || ["email"],
        created_at: item.created_at,
        last_sent_at: item.last_sent_at
      })) || [];
      
      setReminders(typedReminders);
    } catch (error: any) {
      console.error("Error fetching service reminders:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching reminders",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addReminder = async (
    reminderData: Omit<ServiceReminderType, "id" | "created_at" | "last_sent_at"> & { customer_id: string }
  ): Promise<void> => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You must be logged in to add reminders",
        });
        return;
      }

      // Convert string customerId to number for database
      const numericCustomerId = parseInt(reminderData.customer_id, 10);

      const { error } = await supabase
        .from('service_reminders')
        .insert({
          customer_id: numericCustomerId,
          vehicle_info: reminderData.vehicle_info,
          service_type: reminderData.service_type,
          due_date: reminderData.due_date,
          notification_method: reminderData.notification_method,
          reminder_text: reminderData.reminder_text,
          status: reminderData.status || "pending",
        });

      if (error) throw error;

      fetchReminders();
      
      toast({
        title: "Reminder added",
        description: "Service reminder has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding service reminder:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding reminder",
        description: error.message,
      });
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You must be logged in to delete reminders",
        });
        return;
      }

      const { error } = await supabase
        .from('service_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      fetchReminders();
      
      toast({
        title: "Reminder deleted",
        description: "Service reminder has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting service reminder:", error.message);
      toast({
        variant: "destructive",
        title: "Error deleting reminder",
        description: error.message,
      });
    }
  };

  const updateReminderStatus = async (reminderId: string, status: 'pending' | 'sent' | 'completed' | 'cancelled') => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You must be logged in to update reminders",
        });
        return;
      }

      const { error } = await supabase
        .from('service_reminders')
        .update({ 
          status,
          ...(status === 'sent' ? { last_sent_at: new Date().toISOString() } : {})
        })
        .eq('id', reminderId);

      if (error) throw error;

      fetchReminders();
      
      toast({
        title: "Status updated",
        description: `Reminder status updated to ${status}`,
      });
    } catch (error: any) {
      console.error("Error updating reminder status:", error.message);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchReminders();
    }
  }, [customerId, user]);

  return {
    reminders,
    isLoading,
    addReminder,
    deleteReminder,
    updateReminderStatus,
    refreshReminders: fetchReminders
  };
};
