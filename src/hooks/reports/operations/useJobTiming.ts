
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';
import { DateRange } from '../useReportDateRange';

export type JobTimingData = {
  averageCompletionTime: number;
  completionTimeChangePercent: number;
}

export const useJobTiming = (
  userId: string | undefined,
  currentDateRange: DateRange,
  prevDateRange: { startDate: string, endDate: string }
): { data: JobTimingData, isLoading: boolean } => {
  const [data, setData] = useState<JobTimingData>({
    averageCompletionTime: 0,
    completionTimeChangePercent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobTimingData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch completed jobs for current period
        const { data: completedJobs, error: jobsError } = await supabase
          .from('user_jobs')
          .select('start_date, end_date')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('end_date', currentDateRange.startDate)
          .lte('end_date', currentDateRange.endDate);
          
        if (jobsError) throw jobsError;
        
        // Fetch completed jobs for previous period
        const { data: prevPeriodJobs, error: prevJobsError } = await supabase
          .from('user_jobs')
          .select('start_date, end_date')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('end_date', prevDateRange.startDate)
          .lte('end_date', prevDateRange.endDate);
          
        if (prevJobsError) throw prevJobsError;
        
        // Calculate average completion time for current period
        let totalCompletionDays = 0;
        completedJobs?.forEach(job => {
          if (job.start_date && job.end_date) {
            const start = new Date(job.start_date);
            const end = new Date(job.end_date);
            const days = differenceInDays(end, start) || 1; // Minimum 1 day
            totalCompletionDays += days;
          }
        });
        
        const averageCompletionTime = completedJobs && completedJobs.length > 0 ? 
          totalCompletionDays / completedJobs.length : 0;
          
        // Calculate previous period's average completion time
        let prevTotalCompletionDays = 0;
        prevPeriodJobs?.forEach(job => {
          if (job.start_date && job.end_date) {
            const start = new Date(job.start_date);
            const end = new Date(job.end_date);
            const days = differenceInDays(end, start) || 1;
            prevTotalCompletionDays += days;
          }
        });
        
        const prevAverageCompletionTime = prevPeriodJobs && prevPeriodJobs.length > 0 ? 
          prevTotalCompletionDays / prevPeriodJobs.length : 0;
          
        // Calculate completion time change percentage (lower is better, so invert the logic)
        const completionTimeChangePercent = prevAverageCompletionTime > 0
          ? Math.round(((prevAverageCompletionTime / Math.max(0.1, averageCompletionTime)) - 1) * 100)
          : 0;
        
        setData({
          averageCompletionTime,
          completionTimeChangePercent
        });
      } catch (error) {
        console.error('Error fetching job timing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobTimingData();
  }, [userId, currentDateRange.startDate, currentDateRange.endDate, prevDateRange.startDate, prevDateRange.endDate]);
  
  return { data, isLoading };
};
