
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { DateRange } from './useReportDateRange';

type MonthlyData = {
  name: string;
  value: number;
};

type RevenueReportData = {
  monthlyRevenue: number;
  averageJobValue: number;
  partsRevenue: number;
  laborRevenue: number;
  revenueData: MonthlyData[];
  revenueChangePercent: number;
  avgJobValueChangePercent: number;
  partsRevenueChangePercent: number;
  laborRevenueChangePercent: number;
};

export const useRevenueReports = (dateRange?: DateRange) => {
  const [data, setData] = useState<RevenueReportData>({
    monthlyRevenue: 0,
    averageJobValue: 0,
    partsRevenue: 0,
    laborRevenue: 0,
    revenueData: [],
    revenueChangePercent: 0,
    avgJobValueChangePercent: 0,
    partsRevenueChangePercent: 0,
    laborRevenueChangePercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRevenueData = async () => {
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
        
        // Fetch current period's invoice data
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('user_invoices')
          .select('total, subtotal, tax_total')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (invoiceError) throw invoiceError;
        
        // Fetch previous period's invoice data for comparison
        const { data: prevInvoiceData, error: prevInvoiceError } = await supabase
          .from('user_invoices')
          .select('total, subtotal, tax_total')
          .eq('user_id', user.id)
          .gte('date', prevStartDate)
          .lte('date', prevEndDate);
          
        if (prevInvoiceError) throw prevInvoiceError;
        
        // Calculate monthly revenue
        const monthlyRevenue = invoiceData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
        const prevMonthlyRevenue = prevInvoiceData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
        
        // Calculate revenue change percentage
        const revenueChangePercent = prevMonthlyRevenue > 0 
          ? Math.round(((monthlyRevenue / prevMonthlyRevenue) - 1) * 100) 
          : 0;
        
        // Fetch completed jobs for average job value
        const { data: jobsData, error: jobsError } = await supabase
          .from('user_jobs')
          .select('cost')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', startDate)
          .lte('end_date', endDate);
          
        if (jobsError) throw jobsError;
        
        // Fetch previous period's jobs
        const { data: prevJobsData, error: prevJobsError } = await supabase
          .from('user_jobs')
          .select('cost')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', prevStartDate)
          .lte('end_date', prevEndDate);
          
        if (prevJobsError) throw prevJobsError;
        
        // Calculate average job value
        const completedJobsWithCost = jobsData?.filter(job => job.cost !== null && job.cost > 0) || [];
        const totalJobCost = completedJobsWithCost.reduce((sum, job) => sum + Number(job.cost), 0);
        const averageJobValue = completedJobsWithCost.length > 0 ? totalJobCost / completedJobsWithCost.length : 0;
        
        // Calculate previous period's average job value
        const prevCompletedJobsWithCost = prevJobsData?.filter(job => job.cost !== null && job.cost > 0) || [];
        const prevTotalJobCost = prevCompletedJobsWithCost.reduce((sum, job) => sum + Number(job.cost), 0);
        const prevAverageJobValue = prevCompletedJobsWithCost.length > 0 ? prevTotalJobCost / prevCompletedJobsWithCost.length : 0;
        
        // Calculate average job value change percentage
        const avgJobValueChangePercent = prevAverageJobValue > 0
          ? Math.round(((averageJobValue / prevAverageJobValue) - 1) * 100)
          : 0;
        
        // Estimate parts vs labor revenue (in a real app, you'd want a more precise way to track this)
        // For this example, we'll assume 40% parts, 60% labor, but ideally this would come from line items
        const partsRevenue = monthlyRevenue * 0.4;
        const laborRevenue = monthlyRevenue * 0.6;
        const prevPartsRevenue = prevMonthlyRevenue * 0.4;
        const prevLaborRevenue = prevMonthlyRevenue * 0.6;
        
        // Calculate parts and labor revenue change percentages
        const partsRevenueChangePercent = prevPartsRevenue > 0
          ? Math.round(((partsRevenue / prevPartsRevenue) - 1) * 100)
          : 0;
          
        const laborRevenueChangePercent = prevLaborRevenue > 0
          ? Math.round(((laborRevenue / prevLaborRevenue) - 1) * 100)
          : 0;
        
        // Get historical revenue data for chart visualization
        // If using a custom date range, show appropriate data points based on the range
        const revenueData: MonthlyData[] = [];
        
        // For shorter ranges (1-14 days), show daily data
        // For medium ranges (15-60 days), show weekly data
        // For longer ranges (>60 days), show monthly data
        const daysDuration = Math.max(1, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) + 1;

        if (daysDuration <= 14) {
          // Daily data
          for (let i = 0; i < daysDuration; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            const dayFormatted = format(day, 'yyyy-MM-dd');
            const dayLabel = format(day, 'MMM d');
            
            const { data: dayInvoices } = await supabase
              .from('user_invoices')
              .select('total')
              .eq('user_id', user.id)
              .eq('date', dayFormatted);
              
            const dayValue = dayInvoices?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
            revenueData.push({ name: dayLabel, value: dayValue });
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
            const weekLabel = `${format(weekStart, 'MMM d')}-${format(weekEnd, 'MMM d')}`;
            
            const { data: weekInvoices } = await supabase
              .from('user_invoices')
              .select('total')
              .eq('user_id', user.id)
              .gte('date', weekStartFormatted)
              .lte('date', weekEndFormatted);
              
            const weekValue = weekInvoices?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
            revenueData.push({ name: weekLabel, value: weekValue });
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
            
            const { data: monthInvoices } = await supabase
              .from('user_invoices')
              .select('total')
              .eq('user_id', user.id)
              .gte('date', rangeStartFormatted)
              .lte('date', rangeEndFormatted);
              
            const monthValue = monthInvoices?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
            revenueData.push({ name: monthLabel, value: monthValue });
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }
        
        setData({
          monthlyRevenue,
          averageJobValue,
          partsRevenue,
          laborRevenue,
          revenueData,
          revenueChangePercent,
          avgJobValueChangePercent,
          partsRevenueChangePercent,
          laborRevenueChangePercent,
        });
      } catch (error) {
        console.error('Error fetching revenue reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [user, dateRange?.startDate, dateRange?.endDate]);

  return {
    ...data,
    isLoading,
  };
};
