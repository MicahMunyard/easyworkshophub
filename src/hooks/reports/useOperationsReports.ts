
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { DateRange } from './useReportDateRange';

type MonthlyData = {
  name: string;
  value: number;
};

type OperationsReportData = {
  jobsCompleted: number;
  averageCompletionTime: number;
  shopUtilization: number;
  technicianEfficiency: number;
  jobsData: MonthlyData[];
  jobsChangePercent: number;
  completionTimeChangePercent: number;
  utilizationChangePercent: number;
  efficiencyChangePercent: number;
};

export const useOperationsReports = (dateRange?: DateRange) => {
  const [data, setData] = useState<OperationsReportData>({
    jobsCompleted: 0,
    averageCompletionTime: 0,
    shopUtilization: 0,
    technicianEfficiency: 0,
    jobsData: [],
    jobsChangePercent: 0,
    completionTimeChangePercent: 0,
    utilizationChangePercent: 0,
    efficiencyChangePercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOperationsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get current date range
        const startDate = dateRange?.startDate || format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = dateRange?.endDate || format(endOfMonth(new Date()), 'yyyy-MM-dd');
        
        // Calculate previous period (same duration, but before the current period)
        const currentStartDate = new Date(startDate);
        const currentEndDate = new Date(endDate);
        const daysDifference = Math.floor((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const prevPeriodEndDate = new Date(startDate);
        prevPeriodEndDate.setDate(prevPeriodEndDate.getDate() - 1);
        const prevPeriodStartDate = new Date(prevPeriodEndDate);
        prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - daysDifference);
        
        const prevStartDate = format(prevPeriodStartDate, 'yyyy-MM-dd');
        const prevEndDate = format(prevPeriodEndDate, 'yyyy-MM-dd');
        
        // Fetch completed jobs for this period
        const { data: completedJobs, error: jobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', startDate)
          .lte('end_date', endDate);
          
        if (jobsError) throw jobsError;
        
        // Fetch completed jobs for previous period
        const { data: prevPeriodJobs, error: prevJobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', prevStartDate)
          .lte('end_date', prevEndDate);
          
        if (prevJobsError) throw prevJobsError;
        
        // Count jobs completed
        const jobsCompleted = completedJobs?.length || 0;
        const prevJobsCompleted = prevPeriodJobs?.length || 0;
        
        // Calculate jobs change percentage
        const jobsChangePercent = prevJobsCompleted > 0
          ? Math.round(((jobsCompleted / prevJobsCompleted) - 1) * 100)
          : 0;
        
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
        
        // Calculate shop utilization (based on booked time vs available time)
        // Fetch service bays to know capacity
        const { data: bays, error: baysError } = await supabase
          .from('user_service_bays')
          .select('id')
          .eq('user_id', user.id);
          
        if (baysError) throw baysError;
        
        // Fetch bookings for current period utilization
        const { data: bookings, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', user.id)
          .gte('booking_date', startDate)
          .lte('booking_date', endDate);
          
        if (bookingsError) throw bookingsError;
        
        // Fetch bookings for previous period utilization
        const { data: prevBookings, error: prevBookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', user.id)
          .gte('booking_date', prevStartDate)
          .lte('booking_date', prevEndDate);
          
        if (prevBookingsError) throw prevBookingsError;
        
        // Calculate capacity utilization
        const daysInPeriod = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        const workingDays = Math.round(daysInPeriod * 5/7); // Approximating working days (weekdays)
        const totalBayHours = (bays?.length || 1) * workingDays * 8; // Total available bay hours
        
        const totalBookedMinutes = bookings?.reduce((sum, booking) => sum + (booking.duration || 0), 0) || 0;
        const totalBookedHours = totalBookedMinutes / 60;
        const shopUtilization = Math.min(100, Math.round((totalBookedHours / totalBayHours) * 100));
        
        const prevTotalBookedMinutes = prevBookings?.reduce((sum, booking) => sum + (booking.duration || 0), 0) || 0;
        const prevTotalBookedHours = prevTotalBookedMinutes / 60;
        const prevShopUtilization = Math.min(100, Math.round((prevTotalBookedHours / totalBayHours) * 100));
        
        // Calculate utilization change percentage
        const utilizationChangePercent = prevShopUtilization > 0
          ? Math.round(((shopUtilization / prevShopUtilization) - 1) * 100)
          : 0;
        
        // Calculate technician efficiency (actual hours vs available hours)
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('duration')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (timeError) throw timeError;
        
        // Get time entries for previous period
        const { data: prevTimeEntries, error: prevTimeError } = await supabase
          .from('time_entries')
          .select('duration')
          .eq('user_id', user.id)
          .gte('date', prevStartDate)
          .lte('date', prevEndDate);
          
        if (prevTimeError) throw prevTimeError;
        
        // Get technicians
        const { data: technicians, error: techError } = await supabase
          .from('user_technicians')
          .select('id')
          .eq('user_id', user.id)
          .eq('active', true);
          
        if (techError) throw techError;
        
        // Calculate efficiency (logged time vs available time)
        const loggedMinutes = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;
        const totalTechMinutes = (technicians?.length || 1) * workingDays * 8 * 60; // Total available tech minutes
        const technicianEfficiency = Math.min(98, Math.round((loggedMinutes / totalTechMinutes) * 100)); // Cap at 98%
        
        const prevLoggedMinutes = prevTimeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;
        const prevTechnicianEfficiency = Math.min(98, Math.round((prevLoggedMinutes / totalTechMinutes) * 100));
        
        // Calculate efficiency change percentage
        const efficiencyChangePercent = prevTechnicianEfficiency > 0
          ? Math.round(((technicianEfficiency / prevTechnicianEfficiency) - 1) * 100)
          : 0;
        
        // Get historical jobs data for visualization based on the current date range
        const jobsData: MonthlyData[] = [];
        
        // Adjust the chart data based on the date range
        const daysDuration = Math.max(1, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) + 1;

        if (daysDuration <= 14) {
          // Daily data
          for (let i = 0; i < daysDuration; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            const dayFormatted = format(day, 'yyyy-MM-dd');
            const dayLabel = format(day, 'MMM d');
            
            const { data: dayJobs } = await supabase
              .from('user_jobs')
              .select('id')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .eq('end_date', dayFormatted);
              
            const dayValue = dayJobs?.length || 0;
            jobsData.push({ name: dayLabel, value: dayValue });
          }
        } else if (daysDuration <= 60) {
          // Weekly data
          const numWeeks = Math.ceil(daysDuration / 7);
          
          for (let i = 0; i < numWeeks; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            // Ensure we don't go beyond our end date
            if (weekEnd > new Date(endDate)) {
              weekEnd.setTime(new Date(endDate).getTime());
            }
            
            const weekStartFormatted = format(weekStart, 'yyyy-MM-dd');
            const weekEndFormatted = format(weekEnd, 'yyyy-MM-dd');
            const weekLabel = `${format(weekStart, 'MMM d')}-${format(weekEnd, 'd')}`;
            
            const { data: weekJobs } = await supabase
              .from('user_jobs')
              .select('id')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .gte('end_date', weekStartFormatted)
              .lte('end_date', weekEndFormatted);
              
            const weekValue = weekJobs?.length || 0;
            jobsData.push({ name: weekLabel, value: weekValue });
          }
        } else {
          // Monthly data
          let currentDate = new Date(startDate);
          const endDateTime = new Date(endDate).getTime();
          
          while (currentDate.getTime() <= endDateTime) {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            
            // Ensure we stay within our range
            const rangeStart = monthStart < new Date(startDate) ? new Date(startDate) : monthStart;
            const rangeEnd = monthEnd > new Date(endDate) ? new Date(endDate) : monthEnd;
            
            const rangeStartFormatted = format(rangeStart, 'yyyy-MM-dd');
            const rangeEndFormatted = format(rangeEnd, 'yyyy-MM-dd');
            const monthLabel = format(currentDate, 'MMM yyyy');
            
            const { data: monthJobs } = await supabase
              .from('user_jobs')
              .select('id')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .gte('end_date', rangeStartFormatted)
              .lte('end_date', rangeEndFormatted);
              
            const monthValue = monthJobs?.length || 0;
            jobsData.push({ name: monthLabel, value: monthValue });
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }
        
        setData({
          jobsCompleted,
          averageCompletionTime,
          shopUtilization,
          technicianEfficiency,
          jobsData,
          jobsChangePercent,
          completionTimeChangePercent,
          utilizationChangePercent,
          efficiencyChangePercent,
        });
      } catch (error) {
        console.error('Error fetching operations reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperationsData();
  }, [user, dateRange?.startDate, dateRange?.endDate]);

  return {
    ...data,
    isLoading,
  };
};
