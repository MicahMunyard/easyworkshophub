
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';
import { DateRange } from '../useReportDateRange';

export type WorkshopUtilizationData = {
  shopUtilization: number;
  technicianEfficiency: number;
  utilizationChangePercent: number;
  efficiencyChangePercent: number;
}

export const useWorkshopUtilization = (
  userId: string | undefined,
  currentDateRange: DateRange,
  prevDateRange: { startDate: string, endDate: string }
): { data: WorkshopUtilizationData, isLoading: boolean } => {
  const [data, setData] = useState<WorkshopUtilizationData>({
    shopUtilization: 0,
    technicianEfficiency: 0,
    utilizationChangePercent: 0,
    efficiencyChangePercent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUtilizationData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch service bays to know capacity
        const { data: bays, error: baysError } = await supabase
          .from('user_service_bays')
          .select('id')
          .eq('user_id', userId);
          
        if (baysError) throw baysError;
        
        // Fetch bookings for current period utilization
        const { data: bookings, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', userId)
          .gte('booking_date', currentDateRange.startDate)
          .lte('booking_date', currentDateRange.endDate);
          
        if (bookingsError) throw bookingsError;
        
        // Fetch bookings for previous period utilization
        const { data: prevBookings, error: prevBookingsError } = await supabase
          .from('user_bookings')
          .select('duration')
          .eq('user_id', userId)
          .gte('booking_date', prevDateRange.startDate)
          .lte('booking_date', prevDateRange.endDate);
          
        if (prevBookingsError) throw prevBookingsError;
        
        // Calculate capacity utilization
        const daysInPeriod = differenceInDays(new Date(currentDateRange.endDate), new Date(currentDateRange.startDate)) + 1;
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
          .eq('user_id', userId)
          .gte('date', currentDateRange.startDate)
          .lte('date', currentDateRange.endDate);
          
        if (timeError) throw timeError;
        
        // Get time entries for previous period
        const { data: prevTimeEntries, error: prevTimeError } = await supabase
          .from('time_entries')
          .select('duration')
          .eq('user_id', userId)
          .gte('date', prevDateRange.startDate)
          .lte('date', prevDateRange.endDate);
          
        if (prevTimeError) throw prevTimeError;
        
        // Get technicians
        const { data: technicians, error: techError } = await supabase
          .from('user_technicians')
          .select('id')
          .eq('user_id', userId)
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
        
        setData({
          shopUtilization,
          technicianEfficiency,
          utilizationChangePercent,
          efficiencyChangePercent
        });
      } catch (error) {
        console.error('Error fetching workshop utilization data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUtilizationData();
  }, [userId, currentDateRange.startDate, currentDateRange.endDate, prevDateRange.startDate, prevDateRange.endDate]);
  
  return { data, isLoading };
};
