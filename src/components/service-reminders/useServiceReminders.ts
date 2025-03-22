
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder } from "./types";
import { useAuth } from "@/contexts/AuthContext";

export const useServiceReminders = (customerId: number) => {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_reminders')
        .select('*')
        .eq('customer_id', customerId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Type casting to ensure data matches ServiceReminder interface
      const typedReminders: ServiceReminder[] = data?.map(reminder => ({
        id: reminder.id,
        vehicle_info: reminder.vehicle_info,
        service_type: reminder.service_type,
        due_date: reminder.due_date,
        status: reminder.status as 'pending' | 'sent' | 'completed' | 'cancelled',
        notification_method: reminder.notification_method || ['email'],
        created_at: reminder.created_at,
        last_sent_at: reminder.last_sent_at,
        reminder_text: reminder.reminder_text
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

  const addReminder = async (reminderData: Omit<ServiceReminder, 'id' | 'created_at' | 'last_sent_at'> & { customer_id: number }) => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You must be logged in to add reminders",
        });
        return false;
      }

      const { error } = await supabase
        .from('service_reminders')
        .insert(reminderData);

      if (error) throw error;

      fetchReminders();
      
      toast({
        title: "Reminder added",
        description: "Service reminder has been added successfully",
      });

      return true;
    } catch (error: any) {
      console.error("Error adding service reminder:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding reminder",
        description: error.message,
      });
      return false;
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
  }, [customerId]);

  return {
    reminders,
    isLoading,
    addReminder,
    deleteReminder,
    updateReminderStatus,
    refreshReminders: fetchReminders
  };
};
