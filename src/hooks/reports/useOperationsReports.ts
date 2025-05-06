
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
};

export const useOperationsReports = () => {
  const [data, setData] = useState<OperationsReportData>({
    jobsCompleted: 0,
    averageCompletionTime: 0,
    shopUtilization: 0,
    technicianEfficiency: 0,
    jobsData: [],
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
        
        // Fetch completed jobs for this month
        const { data: completedJobs, error: jobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', startDate)
          .lte('end_date', endDate);
          
        if (jobsError) throw jobsError;
        
        // Count jobs completed
        const jobsCompleted = completedJobs?.length || 0;
        
        // Calculate average completion time
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
        
        // Calculate shop utilization (based on booked time vs available time)
        // Fetch service bays to know capacity
        const { data: bays, error: baysError } = await supabase
          .from('user_service_bays')
          .select('id')
          .eq('user_id', user.id);
          
        if (baysError) throw baysError;
        
        // Fetch bookings for utilization
        const { data: bookings, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', user.id)
          .gte('booking_date', startDate)
          .lte('booking_date', endDate);
          
        if (bookingsError) throw bookingsError;
        
        // Calculate capacity utilization (assuming 8 hour work days)
        const daysInMonth = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        const workingDays = Math.round(daysInMonth * 5/7); // Approximating working days (weekdays)
        const totalBayHours = (bays?.length || 1) * workingDays * 8; // Total available bay hours
        const totalBookedMinutes = bookings?.reduce((sum, booking) => sum + (booking.duration || 0), 0) || 0;
        const totalBookedHours = totalBookedMinutes / 60;
        const shopUtilization = Math.min(100, Math.round((totalBookedHours / totalBayHours) * 100));
        
        // Calculate technician efficiency (actual hours vs available hours)
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('duration')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (timeError) throw timeError;
        
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
