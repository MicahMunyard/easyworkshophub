
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
};

export const useRevenueReports = () => {
  const [data, setData] = useState<RevenueReportData>({
    monthlyRevenue: 0,
    averageJobValue: 0,
    partsRevenue: 0,
    laborRevenue: 0,
    revenueData: [],
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
        // Get current month's revenue from invoices
        const currentMonth = new Date();
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        // Fetch current month's invoice data
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('user_invoices')
          .select('total, subtotal, tax_total')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (invoiceError) throw invoiceError;
        
        // Calculate monthly revenue
        const monthlyRevenue = invoiceData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;
        
        // Fetch completed jobs for average job value
        const { data: jobsData, error: jobsError } = await supabase
          .from('user_jobs')
          .select('cost')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('end_date', startDate)
          .lte('end_date', endDate);
          
        if (jobsError) throw jobsError;
        
        // Calculate average job value
        const completedJobsWithCost = jobsData?.filter(job => job.cost !== null && job.cost > 0) || [];
        const totalJobCost = completedJobsWithCost.reduce((sum, job) => sum + Number(job.cost), 0);
        const averageJobValue = completedJobsWithCost.length > 0 ? totalJobCost / completedJobsWithCost.length : 0;
        
        // Estimate parts vs labor revenue (in a real app, you'd want a more precise way to track this)
        // For this example, we'll assume 40% parts, 60% labor, but ideally this would come from line items
        const partsRevenue = monthlyRevenue * 0.4;
        const laborRevenue = monthlyRevenue * 0.6;
        
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
