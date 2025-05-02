
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CompletedJobWithCustomer } from './types';
import { fetchFinishedJobsData, fetchCustomerInfoForJob } from './api/invoiceApi';
import { transformCompletedJob } from './utils/transformUtils';

export const useCompletedJobs = () => {
  const [completedJobs, setCompletedJobs] = useState<CompletedJobWithCustomer[]>([]);
  const { user } = useAuth();

  const fetchCompletedJobs = async () => {
    if (!user) return;
    
    try {
      // Changed to fetch only finished jobs, not completed ones
      const { data, error } = await fetchFinishedJobsData(user.id);
        
      if (error) throw error;
      
      if (data) {
        const transformedJobs = await Promise.all(data.map(async (job) => {
          let customerEmail = '';
          let customerPhone = '';
          
          try {
            const { data: bookingData, error: bookingError } = await fetchCustomerInfoForJob(job.customer, user.id);
              
            if (bookingData && !bookingError) {
              customerEmail = bookingData.customer_email || '';
              customerPhone = bookingData.customer_phone || '';
            }
          } catch (error) {
            console.error('Error fetching customer info:', error);
          }
          
          return transformCompletedJob(job, customerEmail, customerPhone);
        }));
        
        setCompletedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching finished jobs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompletedJobs();
    }
  }, [user]);

  return { completedJobs };
};
