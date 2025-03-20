
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CommunicationLogEntryType, CommunicationLogFormData } from "./types";

export const useCommunicationLog = (customerId: number) => {
  const [logs, setLogs] = useState<CommunicationLogEntryType[]>([]);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const initialFormData: CommunicationLogFormData = {
    type: 'phone',
    direction: 'outbound',
    content: '',
    duration: undefined,
    staff_member: profile?.full_name || user?.email || ''
  };
  
  const [newLog, setNewLog] = useState<CommunicationLogFormData>(initialFormData);

  useEffect(() => {
    fetchLogs();
  }, [customerId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('customer_id', customerId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      // Type casting the data to ensure it matches CommunicationLogEntry
      const typedLogs: CommunicationLogEntryType[] = data?.map(log => ({
        id: log.id,
        type: log.type as 'phone' | 'email' | 'sms',
        direction: log.direction as 'inbound' | 'outbound',
        content: log.content,
        timestamp: log.timestamp,
        staff_member: log.staff_member,
        duration: log.duration,
        status: log.status
      })) || [];
      
      setLogs(typedLogs);
    } catch (error: any) {
      console.error("Error fetching communication logs:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching logs",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = async (logData: CommunicationLogFormData) => {
    try {
      const { error } = await supabase
        .from('communication_logs')
        .insert({
          customer_id: customerId,
          type: logData.type,
          direction: logData.direction,
          content: logData.content?.trim(),
          staff_member: logData.staff_member?.trim() || profile?.full_name || user?.email || 'Unknown',
          duration: logData.type === 'phone' ? logData.duration : null,
          status: logData.type !== 'phone' ? 'sent' : null
        });

      if (error) throw error;

      resetForm();
      fetchLogs();
      
      toast({
        title: "Log added",
        description: "Communication log has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding communication log:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding log",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setNewLog(initialFormData);
    setIsAddingLog(false);
  };

  return {
    logs,
    isLoading,
    isAddingLog,
    setIsAddingLog,
    newLog,
    setNewLog,
    addLog,
    resetForm
  };
};
