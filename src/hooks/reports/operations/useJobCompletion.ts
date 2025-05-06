
import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '../useReportDateRange';
import { MonthlyData } from '../types';

export type JobCompletionData = {
  jobsCompleted: number;
  jobsChangePercent: number;
  jobsData: MonthlyData[];
}

export const useJobCompletion = (
  userId: string | undefined,
  currentDateRange: DateRange,
  prevDateRange: { startDate: string, endDate: string }
): { data: JobCompletionData, isLoading: boolean } => {
  const [data, setData] = useState<JobCompletionData>({
    jobsCompleted: 0,
    jobsChangePercent: 0,
    jobsData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobCompletionData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch completed jobs for current period
        const { data: completedJobs, error: jobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('end_date', currentDateRange.startDate)
          .lte('end_date', currentDateRange.endDate);
          
        if (jobsError) throw jobsError;
        
        // Fetch completed jobs for previous period for comparison
        const { data: prevPeriodJobs, error: prevJobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('end_date', prevDateRange.startDate)
          .lte('end_date', prevDateRange.endDate);
          
        if (prevJobsError) throw prevJobsError;
        
        // Count jobs completed
        const jobsCompleted = completedJobs?.length || 0;
        const prevJobsCompleted = prevPeriodJobs?.length || 0;
        
        // Calculate jobs change percentage
        const jobsChangePercent = prevJobsCompleted > 0
          ? Math.round(((jobsCompleted / prevJobsCompleted) - 1) * 100)
          : 0;

        // Get historical jobs data for visualization based on the current date range
        const jobsData = await fetchJobsChartData(userId, currentDateRange);
        
        setData({
          jobsCompleted,
          jobsChangePercent,
          jobsData,
        });
      } catch (error) {
        console.error('Error fetching job completion data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCompletionData();
  }, [userId, currentDateRange.startDate, currentDateRange.endDate, prevDateRange.startDate, prevDateRange.endDate]);
  
  return { data, isLoading };
};

// Helper function to fetch chart data with appropriate granularity
async function fetchJobsChartData(userId: string, dateRange: DateRange): Promise<MonthlyData[]> {
  const jobsData: MonthlyData[] = [];
  
  // Calculate days in period for determining appropriate chart granularity
  const daysDuration = Math.max(1, Math.floor((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))) + 1;

  if (daysDuration <= 14) {
    // Daily data
    for (let i = 0; i < daysDuration; i++) {
      const day = new Date(dateRange.startDate);
      day.setDate(day.getDate() + i);
      const dayFormatted = format(day, 'yyyy-MM-dd');
      const dayLabel = format(day, 'MMM d');
      
      const { data: dayJobs } = await supabase
        .from('user_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .eq('end_date', dayFormatted);
        
      const dayValue = dayJobs?.length || 0;
      jobsData.push({ name: dayLabel, value: dayValue });
    }
  } else if (daysDuration <= 60) {
    // Weekly data
    const numWeeks = Math.ceil(daysDuration / 7);
    
    for (let i = 0; i < numWeeks; i++) {
      const weekStart = new Date(dateRange.startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Ensure we don't go beyond our end date
      if (weekEnd > new Date(dateRange.endDate)) {
        weekEnd.setTime(new Date(dateRange.endDate).getTime());
      }
      
      const weekStartFormatted = format(weekStart, 'yyyy-MM-dd');
      const weekEndFormatted = format(weekEnd, 'yyyy-MM-dd');
      const weekLabel = `${format(weekStart, 'MMM d')}-${format(weekEnd, 'd')}`;
      
      const { data: weekJobs } = await supabase
        .from('user_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('end_date', weekStartFormatted)
        .lte('end_date', weekEndFormatted);
        
      const weekValue = weekJobs?.length || 0;
      jobsData.push({ name: weekLabel, value: weekValue });
    }
  } else {
    // Monthly data
    let currentDate = new Date(dateRange.startDate);
    const endDateTime = new Date(dateRange.endDate).getTime();
    
    while (currentDate.getTime() <= endDateTime) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Ensure we stay within our range
      const rangeStart = monthStart < new Date(dateRange.startDate) ? new Date(dateRange.startDate) : monthStart;
      const rangeEnd = monthEnd > new Date(dateRange.endDate) ? new Date(dateRange.endDate) : monthEnd;
      
      const rangeStartFormatted = format(rangeStart, 'yyyy-MM-dd');
      const rangeEndFormatted = format(rangeEnd, 'yyyy-MM-dd');
      const monthLabel = format(currentDate, 'MMM yyyy');
      
      const { data: monthJobs } = await supabase
        .from('user_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('end_date', rangeStartFormatted)
        .lte('end_date', rangeEndFormatted);
        
      const monthValue = monthJobs?.length || 0;
      jobsData.push({ name: monthLabel, value: monthValue });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  
  return jobsData;
}
