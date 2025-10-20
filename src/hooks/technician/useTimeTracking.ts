
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeEntry";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useTimeTracking = (jobId: string, technicianId: string) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [totalTime, setTotalTime] = useState(0); // total completed time in seconds
  const { toast } = useToast();
  const { user } = useAuth();

  // Check for existing running timer on mount
  useEffect(() => {
    const checkRunningTimer = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('job_id', jobId)
        .eq('technician_id', technicianId)
        .eq('user_id', user.id)
        .is('end_time', null)
        .maybeSingle();

      if (data) {
        setCurrentEntry(data as TimeEntry);
        setIsTimerRunning(true);
        // Calculate elapsed time from start_time to now
        const startTime = new Date(data.start_time).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }
    };

    checkRunningTimer();
  }, [jobId, technicianId, user]);

  // Fetch total completed time for this job
  useEffect(() => {
    const fetchTotalTime = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('time_entries')
        .select('duration')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      if (data) {
        const total = data.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        setTotalTime(total);
      }
    };

    fetchTotalTime();
  }, [jobId, user, isTimerRunning]); // Refetch when timer stops

  // Increment elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

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

      setCurrentEntry(data as TimeEntry);
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

  const pauseTimer = useCallback(async () => {
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
      // Don't reset elapsedTime - keep it visible when paused
      
      toast({
        title: "Timer Paused",
        description: "Time entry has been saved"
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
      toast({
        title: "Error",
        description: "Failed to pause timer",
        variant: "destructive"
      });
    }
  }, [currentEntry, user, toast]);

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
      setElapsedTime(0);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  }, [currentEntry, user]);

  return {
    isTimerRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    currentEntry,
    elapsedTime,
    totalTime
  };
};
