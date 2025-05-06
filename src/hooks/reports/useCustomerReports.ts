
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange } from './useReportDateRange';
import { 
  useCustomerCount, 
  useCustomerRetention, 
  useLifetimeValue 
} from './customers';
import { CustomerReportData } from './customers/types';

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

  // Calculate previous period (same duration, but before the current period)
  const currentStartDate = dateRange?.startDate || format(new Date(), 'yyyy-MM-dd');
  const currentEndDate = dateRange?.endDate || format(new Date(), 'yyyy-MM-dd');
  
  const startDateObj = new Date(currentStartDate);
  const endDateObj = new Date(currentEndDate);
  const daysDifference = Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  const prevPeriodEndObj = new Date(startDateObj);
  prevPeriodEndObj.setDate(prevPeriodEndObj.getDate() - 1);
  
  const prevPeriodStartObj = new Date(prevPeriodEndObj);
  prevPeriodStartObj.setDate(prevPeriodStartObj.getDate() - daysDifference);
  
  const prevStartDate = format(prevPeriodStartObj, 'yyyy-MM-dd');
  const prevEndDate = format(prevPeriodEndObj, 'yyyy-MM-dd');

  // Calculate two periods before (for retention calculation)
  const twoPeriodBeforeEndObj = new Date(prevPeriodStartObj);
  twoPeriodBeforeEndObj.setDate(twoPeriodBeforeEndObj.getDate() - 1);
  
  const twoPeriodBeforeStartObj = new Date(twoPeriodBeforeEndObj);
  twoPeriodBeforeStartObj.setDate(twoPeriodBeforeStartObj.getDate() - daysDifference);
  
  const twoPeriodBeforeStart = format(twoPeriodBeforeStartObj, 'yyyy-MM-dd');
  const twoPeriodBeforeEnd = format(twoPeriodBeforeEndObj, 'yyyy-MM-dd');

  // Use our more focused hooks to fetch different aspects of the report data
  const { data: customerCountData, isLoading: customerCountLoading } = useCustomerCount(
    user?.id,
    { startDate: currentStartDate, endDate: currentEndDate },
    { startDate: prevStartDate, endDate: prevEndDate }
  );

  const { data: retentionData, isLoading: retentionLoading } = useCustomerRetention(
    user?.id,
    { startDate: currentStartDate, endDate: currentEndDate },
    {
      previous: { startDate: prevStartDate, endDate: prevEndDate },
      twoPeriodsBefore: { startDate: twoPeriodBeforeStart, endDate: twoPeriodBeforeEnd }
    }
  );

  const { data: lifetimeValueData, isLoading: lifetimeValueLoading } = useLifetimeValue(user?.id);

  // Combine all data when dependencies change
  useEffect(() => {
    if (!customerCountLoading && !retentionLoading && !lifetimeValueLoading) {
      setData({
        // Customer count data
        totalCustomers: customerCountData.totalCustomers,
        newCustomers: customerCountData.newCustomers,
        newCustomersChangePercent: customerCountData.newCustomersChangePercent,
        customerData: customerCountData.customerData,
        
        // Retention data
        customerRetention: retentionData.customerRetention,
        retentionChangePercent: retentionData.retentionChangePercent,
        
        // Lifetime value data
        averageLifetimeValue: lifetimeValueData.averageLifetimeValue,
        lifetimeValueChangePercent: lifetimeValueData.lifetimeValueChangePercent,
      });
      
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [
    customerCountData, 
    retentionData, 
    lifetimeValueData, 
    customerCountLoading, 
    retentionLoading, 
    lifetimeValueLoading
  ]);

  return {
    ...data,
    isLoading,
  };
};
