
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

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

export const useOperationsReports = () => {
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
        // Get current month's dates
        const currentMonth = new Date();
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        // Get previous month's dates for comparison
        const prevMonth = subMonths(currentMonth, 1);
        const prevMonthStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd');
        const prevMonthEnd = format(endOfMonth(prevMonth), 'yyyy-MM-dd');
        
        // Fetch completed jobs for this month
        const { data: completedJobs, error: jobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', startDate)
          .lte('end_date', endDate);
          
        if (jobsError) throw jobsError;
        
        // Fetch completed jobs for previous month
        const { data: prevMonthJobs, error: prevJobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', prevMonthStart)
          .lte('end_date', prevMonthEnd);
          
        if (prevJobsError) throw prevJobsError;
        
        // Count jobs completed
        const jobsCompleted = completedJobs?.length || 0;
        const prevJobsCompleted = prevMonthJobs?.length || 0;
        
        // Calculate jobs change percentage
        const jobsChangePercent = prevJobsCompleted > 0
          ? Math.round(((jobsCompleted / prevJobsCompleted) - 1) * 100)
          : 0;
        
        // Calculate average completion time for current month
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
          
        // Calculate previous month's average completion time
        let prevTotalCompletionDays = 0;
        prevMonthJobs?.forEach(job => {
          if (job.start_date && job.end_date) {
            const start = new Date(job.start_date);
            const end = new Date(job.end_date);
            const days = differenceInDays(end, start) || 1;
            prevTotalCompletionDays += days;
          }
        });
        
        const prevAverageCompletionTime = prevMonthJobs && prevMonthJobs.length > 0 ? 
          prevTotalCompletionDays / prevMonthJobs.length : 0;
          
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
        
        // Fetch bookings for current month utilization
        const { data: bookings, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', user.id)
          .gte('booking_date', startDate)
          .lte('booking_date', endDate);
          
        if (bookingsError) throw bookingsError;
        
        // Fetch bookings for previous month utilization
        const { data: prevBookings, error: prevBookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', user.id)
          .gte('booking_date', prevMonthStart)
          .lte('booking_date', prevMonthEnd);
          
        if (prevBookingsError) throw prevBookingsError;
        
        // Calculate capacity utilization (assuming 8 hour work days)
        const daysInMonth = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        const workingDays = Math.round(daysInMonth * 5/7); // Approximating working days (weekdays)
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
        
        // Get time entries for previous month
        const { data: prevTimeEntries, error: prevTimeError } = await supabase
          .from('time_entries')
          .select('duration')
          .eq('user_id', user.id)
          .gte('date', prevMonthStart)
          .lte('date', prevMonthEnd);
          
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
        
        // Get historical jobs data for the past 6 months
        const jobsData: MonthlyData[] = [];
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(new Date(), i);
          const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
          const monthName = format(month, 'MMM');
          
          const { data: monthJobs, error: monthError } = await supabase
            .from('user_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('end_date', monthStart)
            .lte('end_date', monthEnd);
            
          if (monthError) throw monthError;
          
          jobsData.push({ name: monthName, value: monthJobs?.length || 0 });
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
  }, [user]);

  return {
    ...data,
    isLoading,
  };
};
