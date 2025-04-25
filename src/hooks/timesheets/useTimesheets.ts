import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeEntry } from '@/types/timeEntry';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TimesheetFilters {
  startDate?: string;
  endDate?: string;
  technicianId?: string;
}

export const useTimesheets = () => {
  const [filters, setFilters] = useState<TimesheetFilters>({});
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries', filters],
    queryFn: async () => {
      let query = supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.technicianId) {
        query = query.eq('technician_id', filters.technicianId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimeEntry[];
    },
  });

  const { mutate: approveEntry } = useMutation({
    mutationFn: async (entry: TimeEntry) => {
      const { error } = await supabase
        .from('time_entries')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', entry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Time entry approved",
        description: "The time entry has been successfully approved."
      });
      setSelectedEntry(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve time entry",
        variant: "destructive"
      });
    }
  });

  const { mutate: addTimeEntry } = useMutation({
    mutationFn: async (entry: Partial<TimeEntry>) => {
      const { error } = await supabase
        .from('time_entries')
        .insert([entry]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Time entry added",
        description: "The time entry has been successfully added."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive"
      });
    }
  });

  return {
    timeEntries,
    isLoading,
    filters,
    setFilters,
    approveEntry,
    selectedEntry,
    setSelectedEntry,
    addTimeEntry,
  };
};
