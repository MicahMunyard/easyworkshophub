
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeEntry";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useTimeTracking = (jobId: string, technicianId: string) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const startTimer = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          job_id: jobId,
          technician_id: technicianId,
          start_time: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentEntry(data);
      setIsTimerRunning(true);
      
      toast({
        title: "Timer Started",
        description: "Time tracking has begun for this job"
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      });
    }
  }, [jobId, technicianId, user, toast]);

  const stopTimer = useCallback(async () => {
    if (!currentEntry || !user) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString()
        })
        .eq('id', currentEntry.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsTimerRunning(false);
      setCurrentEntry(null);
      
      toast({
        title: "Timer Stopped",
        description: "Time entry has been recorded"
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive"
      });
    }
  }, [currentEntry, user, toast]);

  return {
    isTimerRunning,
    startTimer,
    stopTimer,
    currentEntry
  };
};
