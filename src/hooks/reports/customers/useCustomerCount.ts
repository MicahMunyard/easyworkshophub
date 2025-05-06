
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { DateRange } from '../useReportDateRange';
import { MonthlyData } from '../types';

export type CustomerCountData = {
  totalCustomers: number;
  newCustomers: number;
  newCustomersChangePercent: number;
  customerData: MonthlyData[];
}

export const useCustomerCount = (
  userId: string | undefined,
  currentDateRange: DateRange,
  prevDateRange: { startDate: string, endDate: string }
): { data: CustomerCountData, isLoading: boolean } => {
  const [data, setData] = useState<CustomerCountData>({
    totalCustomers: 0,
    newCustomers: 0,
    newCustomersChangePercent: 0,
    customerData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerCounts = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch all active customers
        const { data: allCustomers, error: customersError } = await supabase
          .from('user_customers')
          .select('id, created_at')
          .eq('user_id', userId)
          .eq('status', 'active');
          
        if (customersError) throw customersError;
        
        // Calculate total customers
        const totalCustomers = allCustomers?.length || 0;
        
        // Calculate new customers in the selected period
        const newCustomers = allCustomers?.filter(customer => {
          const createdAt = new Date(customer.created_at);
          return createdAt >= new Date(currentDateRange.startDate) && createdAt <= new Date(currentDateRange.endDate);
        }).length || 0;
        
        // Calculate new customers in the previous period for comparison
        const prevPeriodNewCustomers = allCustomers?.filter(customer => {
          const createdAt = new Date(customer.created_at);
          return createdAt >= new Date(prevDateRange.startDate) && createdAt <= new Date(prevDateRange.endDate);
        }).length || 0;
        
        // Calculate new customers percentage change
        const newCustomersChangePercent = prevPeriodNewCustomers > 0
          ? Math.round(((newCustomers / prevPeriodNewCustomers) - 1) * 100)
          : 0;
        
        // Get customer growth chart data
        const customerData = await fetchCustomerGrowthData(userId, currentDateRange);
        
        setData({
          totalCustomers,
          newCustomers,
          newCustomersChangePercent,
          customerData
        });
      } catch (error) {
        console.error('Error fetching customer counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerCounts();
  }, [userId, currentDateRange.startDate, currentDateRange.endDate, prevDateRange.startDate, prevDateRange.endDate]);
  
  return { data, isLoading };
};

// Helper function to fetch chart data with appropriate granularity
async function fetchCustomerGrowthData(userId: string, dateRange: DateRange): Promise<MonthlyData[]> {
  const customerData: MonthlyData[] = [];
  
  // Calculate days in period for determining appropriate chart granularity
  const daysDuration = Math.max(1, Math.floor((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))) + 1;

  if (daysDuration <= 14) {
    // Daily data
    for (let i = 0; i < daysDuration; i++) {
      const day = new Date(dateRange.startDate);
      day.setDate(day.getDate() + i);
      const dayFormatted = format(day, 'yyyy-MM-dd');
      const dayLabel = format(day, 'MMM d');
      
      const { data: dayCustomers } = await supabase
        .from('user_customers')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${dayFormatted}T00:00:00`)
        .lte('created_at', `${dayFormatted}T23:59:59`);
        
      const dayValue = dayCustomers?.length || 0;
      customerData.push({ name: dayLabel, value: dayValue });
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
      
      const { data: weekCustomers } = await supabase
        .from('user_customers')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${weekStartFormatted}T00:00:00`)
        .lte('created_at', `${weekEndFormatted}T23:59:59`);
        
      const weekValue = weekCustomers?.length || 0;
      customerData.push({ name: weekLabel, value: weekValue });
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
      
      const { data: monthCustomers } = await supabase
        .from('user_customers')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${rangeStartFormatted}T00:00:00`)
        .lte('created_at', `${rangeEndFormatted}T23:59:59`);
        
      const monthValue = monthCustomers?.length || 0;
      customerData.push({ name: monthLabel, value: monthValue });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  
  return customerData;
}
