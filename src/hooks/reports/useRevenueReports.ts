
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

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

export const useRevenueReports = () => {
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
        // Get current and previous month's dates
        const currentMonth = new Date();
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        const prevMonth = subMonths(currentMonth, 1);
        const prevMonthStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd');
        const prevMonthEnd = format(endOfMonth(prevMonth), 'yyyy-MM-dd');
        
        // Fetch current month's invoice data
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('user_invoices')
          .select('total, subtotal, tax_total')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (invoiceError) throw invoiceError;
        
        // Fetch previous month's invoice data for comparison
        const { data: prevMonthInvoiceData, error: prevInvoiceError } = await supabase
          .from('user_invoices')
          .select('total, subtotal, tax_total')
          .eq('user_id', user.id)
          .gte('date', prevMonthStart)
          .lte('date', prevMonthEnd);
          
        if (prevInvoiceError) throw prevInvoiceError;
        
        // Calculate monthly revenue
        const monthlyRevenue = invoiceData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
        const prevMonthlyRevenue = prevMonthInvoiceData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
        
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
        
        // Fetch previous month's jobs
        const { data: prevJobsData, error: prevJobsError } = await supabase
          .from('user_jobs')
          .select('cost')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', prevMonthStart)
          .lte('end_date', prevMonthEnd);
          
        if (prevJobsError) throw prevJobsError;
        
        // Calculate average job value
        const completedJobsWithCost = jobsData?.filter(job => job.cost !== null && job.cost > 0) || [];
        const totalJobCost = completedJobsWithCost.reduce((sum, job) => sum + Number(job.cost), 0);
        const averageJobValue = completedJobsWithCost.length > 0 ? totalJobCost / completedJobsWithCost.length : 0;
        
        // Calculate previous month's average job value
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
        
        // Get historical revenue data for the past 6 months
        const revenueData: MonthlyData[] = [];
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(new Date(), i);
          const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
          const monthName = format(month, 'MMM');
          
          const { data: monthInvoices, error: monthError } = await supabase
            .from('user_invoices')
            .select('total')
            .eq('user_id', user.id)
            .gte('date', monthStart)
            .lte('date', monthEnd);
            
          if (monthError) throw monthError;
          
          const monthValue = monthInvoices?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
          revenueData.push({ name: monthName, value: monthValue });
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
  }, [user]);

  return {
    ...data,
    isLoading,
  };
};
