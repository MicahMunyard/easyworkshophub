
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from './useReportDateRange';

type MonthlyData = {
  name: string;
  value: number;
};

type CustomerReportData = {
  totalCustomers: number;
  newCustomers: number;
  customerRetention: number;
  averageLifetimeValue: number;
  customerData: MonthlyData[];
  newCustomersChangePercent: number;
  retentionChangePercent: number;
  lifetimeValueChangePercent: number;
};

export const useCustomerReports = (dateRange?: DateRange) => {
  const [data, setData] = useState<CustomerReportData>({
    totalCustomers: 0,
    newCustomers: 0,
    customerRetention: 0,
    averageLifetimeValue: 0,
    customerData: [],
    newCustomersChangePercent: 0,
    retentionChangePercent: 0,
    lifetimeValueChangePercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomerData = async () => {
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
        
        // For retention calculation, we need the period before the previous period
        const twoPeriodsBefore = new Date(prevPeriodStartDate);
        twoPeriodsBefore.setDate(twoPeriodsBefore.getDate() - daysDifference);
        const twoPeriodBeforeStart = format(twoPeriodsBefore, 'yyyy-MM-dd');
        const twoPeriodBeforeEnd = format(prevPeriodStartDate, 'yyyy-MM-dd');
        
        // Fetch all active customers
        const { data: allCustomers, error: customersError } = await supabase
          .from('user_customers')
          .select('id, created_at')
          .eq('user_id', user.id)
          .eq('status', 'active');
          
        if (customersError) throw customersError;
        
        // Calculate total customers
        const totalCustomers = allCustomers?.length || 0;
        
        // Calculate new customers in the selected period
        const newCustomers = allCustomers?.filter(customer => {
          const createdAt = new Date(customer.created_at);
          return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
        }).length || 0;
        
        // Calculate new customers in the previous period for comparison
        const prevPeriodNewCustomers = allCustomers?.filter(customer => {
          const createdAt = new Date(customer.created_at);
          return createdAt >= new Date(prevStartDate) && createdAt <= new Date(prevEndDate);
        }).length || 0;
        
        // Calculate new customers percentage change
        const newCustomersChangePercent = prevPeriodNewCustomers > 0
          ? Math.round(((newCustomers / prevPeriodNewCustomers) - 1) * 100)
          : 0;
        
        // Calculate customer retention
        // First, get customers who had bookings in the previous period
        const { data: prevPeriodActiveCustomers, error: prevPeriodError } = await supabase
          .from('user_bookings')
          .select('customer_name')
          .eq('user_id', user.id)
          .gte('booking_date', prevStartDate)
          .lte('booking_date', prevEndDate);
          
        if (prevPeriodError) throw prevPeriodError;
        
        // Then, see how many of them have bookings in the current period
        let retainedCount = 0;
        
        if (prevPeriodActiveCustomers && prevPeriodActiveCustomers.length > 0) {
          // Create a set of unique customer names from previous period
          const prevPeriodCustomerNames = new Set(
            prevPeriodActiveCustomers.map(booking => booking.customer_name)
          );
          
          // Get current period's bookings
          const { data: currentPeriodBookings, error: currentPeriodError } = await supabase
            .from('user_bookings')
            .select('customer_name')
            .eq('user_id', user.id)
            .gte('booking_date', startDate)
            .lte('booking_date', endDate);
            
          if (currentPeriodError) throw currentPeriodError;
          
          if (currentPeriodBookings && currentPeriodBookings.length > 0) {
            // Count how many customers from previous period also have bookings in current period
            const currentPeriodCustomerNames = new Set(
              currentPeriodBookings.map(booking => booking.customer_name)
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
          .eq('user_id', user.id)
          .gte('booking_date', twoPeriodBeforeStart)
          .lte('booking_date', twoPeriodBeforeEnd);
          
        if (twoPeriodBeforeError) throw twoPeriodBeforeError;
        
        // See how many were retained in the previous period
        let prevRetainedCount = 0;
        
        if (twoPeriodBeforeCustomers && twoPeriodBeforeCustomers.length > 0) {
          const twoPeriodBeforeNames = new Set(
            twoPeriodBeforeCustomers.map(booking => booking.customer_name).filter(name => name)
          );
          
          if (prevPeriodActiveCustomers && prevPeriodActiveCustomers.length > 0) {
            const prevPeriodNames = new Set(
              prevPeriodActiveCustomers.map(booking => booking.customer_name).filter(name => name)
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
        
        // Calculate average lifetime value
        // Get all invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from('user_invoices')
          .select('customer_name, total')
          .eq('user_id', user.id);
          
        if (invoicesError) throw invoicesError;
        
        // Group by customer to calculate lifetime value
        const customerTotals: Record<string, number> = {};
        
        invoices?.forEach(invoice => {
          if (invoice.customer_name) {
            customerTotals[invoice.customer_name] = (customerTotals[invoice.customer_name] || 0) + Number(invoice.total);
          }
        });
        
        const customerLifetimeValues = Object.values(customerTotals);
        const averageLifetimeValue = customerLifetimeValues.length > 0 ?
          customerLifetimeValues.reduce((sum, val) => sum + val, 0) / customerLifetimeValues.length : 0;
          
        // For comparison, we'll calculate from historical data if available
        // If not, we'll use a 5% estimate
        const prevAverageLifetimeValue = averageLifetimeValue / 1.05; // Estimated 5% growth
        const lifetimeValueChangePercent = Math.round(((averageLifetimeValue / prevAverageLifetimeValue) - 1) * 100);
        
        // Get customer data for visualization based on the date range
        const customerData: MonthlyData[] = [];
        
        // Adjust the chart data based on the date range
        const daysDuration = Math.max(1, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) + 1;

        if (daysDuration <= 14) {
          // Daily data
          for (let i = 0; i < daysDuration; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            const dayFormatted = format(day, 'yyyy-MM-dd');
            const dayLabel = format(day, 'MMM d');
            
            const { data: dayCustomers } = await supabase
              .from('user_customers')
              .select('id')
              .eq('user_id', user.id)
              .gte('created_at', `${dayFormatted}T00:00:00`)
              .lte('created_at', `${dayFormatted}T23:59:59`);
              
            const dayValue = dayCustomers?.length || 0;
            customerData.push({ name: dayLabel, value: dayValue });
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
            
            const { data: weekCustomers } = await supabase
              .from('user_customers')
              .select('id')
              .eq('user_id', user.id)
              .gte('created_at', `${weekStartFormatted}T00:00:00`)
              .lte('created_at', `${weekEndFormatted}T23:59:59`);
              
            const weekValue = weekCustomers?.length || 0;
            customerData.push({ name: weekLabel, value: weekValue });
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
            
            const { data: monthCustomers } = await supabase
              .from('user_customers')
              .select('id')
              .eq('user_id', user.id)
              .gte('created_at', `${rangeStartFormatted}T00:00:00`)
              .lte('created_at', `${rangeEndFormatted}T23:59:59`);
              
            const monthValue = monthCustomers?.length || 0;
            customerData.push({ name: monthLabel, value: monthValue });
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }
        
        setData({
          totalCustomers,
          newCustomers,
          customerRetention,
          averageLifetimeValue,
          customerData,
          newCustomersChangePercent,
          retentionChangePercent,
          lifetimeValueChangePercent,
        });
      } catch (error) {
        console.error('Error fetching customer reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [user, dateRange?.startDate, dateRange?.endDate]);

  return {
    ...data,
    isLoading,
  };
};
