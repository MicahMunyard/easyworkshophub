
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '../useReportDateRange';

export type CustomerRetentionData = {
  customerRetention: number;
  retentionChangePercent: number;
}

export const useCustomerRetention = (
  userId: string | undefined,
  currentDateRange: DateRange,
  prevPeriods: {
    previous: { startDate: string, endDate: string };
    twoPeriodsBefore: { startDate: string, endDate: string };
  }
): { data: CustomerRetentionData, isLoading: boolean } => {
  const [data, setData] = useState<CustomerRetentionData>({
    customerRetention: 0,
    retentionChangePercent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRetentionData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // First, get customers who had bookings in the previous period
        const { data: prevPeriodActiveCustomers, error: prevPeriodError } = await supabase
          .from('user_bookings')
          .select('customer_name')
          .eq('user_id', userId)
          .gte('booking_date', prevPeriods.previous.startDate)
          .lte('booking_date', prevPeriods.previous.endDate);
          
        if (prevPeriodError) throw prevPeriodError;
        
        // Then, see how many of them have bookings in the current period
        let retainedCount = 0;
        
        if (prevPeriodActiveCustomers && prevPeriodActiveCustomers.length > 0) {
          // Create a set of unique customer names from previous period
          const prevPeriodCustomerNames = new Set(
            prevPeriodActiveCustomers
              .map(booking => booking.customer_name)
              .filter(Boolean) // Filter out null/undefined
          );
          
          // Get current period's bookings
          const { data: currentPeriodBookings, error: currentPeriodError } = await supabase
            .from('user_bookings')
            .select('customer_name')
            .eq('user_id', userId)
            .gte('booking_date', currentDateRange.startDate)
            .lte('booking_date', currentDateRange.endDate);
            
          if (currentPeriodError) throw currentPeriodError;
          
          if (currentPeriodBookings && currentPeriodBookings.length > 0) {
            // Count how many customers from previous period also have bookings in current period
            const currentPeriodCustomerNames = new Set(
              currentPeriodBookings
                .map(booking => booking.customer_name)
                .filter(Boolean) // Filter out null/undefined
            );
            
            prevPeriodCustomerNames.forEach(name => {
              if (name && currentPeriodCustomerNames.has(name)) {
                retainedCount++;
              }
            });
          }
        }
        
        const customerRetention = prevPeriodActiveCustomers && prevPeriodActiveCustomers.length > 0 ?
          Math.round((retainedCount / prevPeriodActiveCustomers.length) * 100) : 0;
          
        // Calculate previous period's retention for comparison
        // Get customers active two periods ago
        const { data: twoPeriodBeforeCustomers, error: twoPeriodBeforeError } = await supabase
          .from('user_bookings')
          .select('customer_name')
          .eq('user_id', userId)
          .gte('booking_date', prevPeriods.twoPeriodsBefore.startDate)
          .lte('booking_date', prevPeriods.twoPeriodsBefore.endDate);
          
        if (twoPeriodBeforeError) throw twoPeriodBeforeError;
        
        // See how many were retained in the previous period
        let prevRetainedCount = 0;
        
        if (twoPeriodBeforeCustomers && twoPeriodBeforeCustomers.length > 0) {
          const twoPeriodBeforeNames = new Set(
            twoPeriodBeforeCustomers
              .map(booking => booking.customer_name)
              .filter(Boolean) // Filter out null/undefined
          );
          
          if (prevPeriodActiveCustomers && prevPeriodActiveCustomers.length > 0) {
            const prevPeriodNames = new Set(
              prevPeriodActiveCustomers
                .map(booking => booking.customer_name)
                .filter(Boolean) // Filter out null/undefined
            );
            
            twoPeriodBeforeNames.forEach(name => {
              if (name && prevPeriodNames.has(name)) {
                prevRetainedCount++;
              }
            });
          }
        }
        
        const prevPeriodRetention = twoPeriodBeforeCustomers && twoPeriodBeforeCustomers.length > 0 ?
          Math.round((prevRetainedCount / twoPeriodBeforeCustomers.length) * 100) : 0;
          
        // Calculate retention change percentage
        const retentionChangePercent = prevPeriodRetention > 0
          ? Math.round(((customerRetention / prevPeriodRetention) - 1) * 100)
          : 0;
        
        setData({
          customerRetention,
          retentionChangePercent
        });
      } catch (error) {
        console.error('Error fetching customer retention data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetentionData();
  }, [
    userId, 
    currentDateRange.startDate, 
    currentDateRange.endDate, 
    prevPeriods.previous.startDate, 
    prevPeriods.previous.endDate,
    prevPeriods.twoPeriodsBefore.startDate,
    prevPeriods.twoPeriodsBefore.endDate
  ]);
  
  return { data, isLoading };
};
