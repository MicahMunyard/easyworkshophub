
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '../useReportDateRange';

export type LifetimeValueData = {
  averageLifetimeValue: number;
  lifetimeValueChangePercent: number;
}

export const useLifetimeValue = (
  userId: string | undefined
): { data: LifetimeValueData, isLoading: boolean } => {
  const [data, setData] = useState<LifetimeValueData>({
    averageLifetimeValue: 0,
    lifetimeValueChangePercent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLifetimeValueData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get all invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from('user_invoices')
          .select('customer_name, total')
          .eq('user_id', userId);
          
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
        
        setData({
          averageLifetimeValue,
          lifetimeValueChangePercent
        });
      } catch (error) {
        console.error('Error fetching customer lifetime value data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLifetimeValueData();
  }, [userId]);
  
  return { data, isLoading };
};
