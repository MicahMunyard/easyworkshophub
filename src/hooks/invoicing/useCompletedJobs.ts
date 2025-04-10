
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CompletedJobWithCustomer } from './types';
import { fetchCompletedJobsData, fetchCustomerInfoForJob } from './api/invoiceApi';
import { transformCompletedJob } from './utils/transformUtils';

export const useCompletedJobs = () => {
  const [completedJobs, setCompletedJobs] = useState<CompletedJobWithCustomer[]>([]);
  const { user } = useAuth();

  const fetchCompletedJobs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await fetchCompletedJobsData(user.id);
        
      if (error) throw error;
      
      if (data) {
        const transformedJobs = await Promise.all(data.map(async (job) => {
          let customerEmail = '';
          let customerPhone = '';
          
          const { data: bookingData } = await fetchCustomerInfoForJob(job.customer, user.id);
            
          if (bookingData) {
            customerEmail = bookingData.customer_email || '';
            customerPhone = bookingData.customer_phone || '';
          }
          
          return transformCompletedJob(job, customerEmail, customerPhone);
        }));
        
        setCompletedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompletedJobs();
    }
  }, [user]);

  return { completedJobs };
};
