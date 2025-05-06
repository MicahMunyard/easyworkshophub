
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange } from './useReportDateRange';
import { 
  useJobCompletion, 
  useJobTiming, 
  useWorkshopUtilization 
} from './operations';
import { OperationsReportData } from './operations/types';

export const useOperationsReports = (dateRange?: DateRange) => {
  const [data, setData] = useState<OperationsReportData>({
    jobsCompleted: 0,
    averageCompletionTime: 0,
    shopUtilization: 0,
    technicianEfficiency: 0,
    jobsData: [],
    jobsChangePercent: 0,
    completionTimeChangePercent: 0,
    utilizationChangePercent: 0,
    efficiencyChangePercent: 0,
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

  const prevDateRange = {
    startDate: prevStartDate,
    endDate: prevEndDate
  };

  // Use our more focused hooks to fetch different aspects of the report data
  const { data: jobCompletionData, isLoading: jobCompletionLoading } = useJobCompletion(
    user?.id,
    { startDate: currentStartDate, endDate: currentEndDate },
    prevDateRange
  );

  const { data: jobTimingData, isLoading: jobTimingLoading } = useJobTiming(
    user?.id,
    { startDate: currentStartDate, endDate: currentEndDate },
    prevDateRange
  );

  const { data: utilizationData, isLoading: utilizationLoading } = useWorkshopUtilization(
    user?.id,
    { startDate: currentStartDate, endDate: currentEndDate },
    prevDateRange
  );

  // Combine all data when dependencies change
  useEffect(() => {
    if (!jobCompletionLoading && !jobTimingLoading && !utilizationLoading) {
      setData({
        // Job completion data
        jobsCompleted: jobCompletionData.jobsCompleted,
        jobsChangePercent: jobCompletionData.jobsChangePercent,
        jobsData: jobCompletionData.jobsData,
        
        // Job timing data
        averageCompletionTime: jobTimingData.averageCompletionTime,
        completionTimeChangePercent: jobTimingData.completionTimeChangePercent,
        
        // Utilization data
        shopUtilization: utilizationData.shopUtilization,
        technicianEfficiency: utilizationData.technicianEfficiency,
        utilizationChangePercent: utilizationData.utilizationChangePercent,
        efficiencyChangePercent: utilizationData.efficiencyChangePercent,
      });
      
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [
    jobCompletionData, 
    jobTimingData, 
    utilizationData, 
    jobCompletionLoading, 
    jobTimingLoading, 
    utilizationLoading
  ]);

  return {
    ...data,
    isLoading,
  };
};
