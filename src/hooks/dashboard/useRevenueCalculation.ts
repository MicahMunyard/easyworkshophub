
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useRevenueCalculation = () => {
  const calculateTodayRevenue = async (userId: string): Promise<number> => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get completed bookings for today to calculate revenue
      const { data: completedBookingsData, error: completedBookingsError } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('booking_date', today)
        .eq('status', 'completed')
        .eq('user_id', userId);
        
      if (completedBookingsError) throw completedBookingsError;
      
      // Calculate revenue from completed bookings
      let dailyRevenue = 0;
      
      for (const booking of completedBookingsData || []) {
        // First check if we have a direct cost on the booking
        if (booking.cost && !isNaN(parseFloat(String(booking.cost)))) {
          dailyRevenue += parseFloat(String(booking.cost));
          continue;
        }
        
        // If no direct cost, try to get the service by ID
        if (booking.service_id) {
          const { data: serviceData, error: serviceError } = await supabase
            .from('user_services')
            .select('price')
            .eq('id', booking.service_id)
            .eq('user_id', userId)
            .single();
            
          if (!serviceError && serviceData && serviceData.price) {
            dailyRevenue += parseFloat(String(serviceData.price));
            continue;
          }
        }
        
        // Finally, try to parse price from service description (Oil Change $50)
        if (booking.service) {
          const pricingMatch = booking.service.match(/\$(\d+(\.\d+)?)/);
          if (pricingMatch && !isNaN(parseFloat(pricingMatch[1]))) {
            dailyRevenue += parseFloat(pricingMatch[1]);
          }
        }
      }
      
      // Also check the jobs table for any completed jobs with revenue
      const { data: completedJobsData, error: completedJobsError } = await supabase
        .from('user_jobs')
        .select('*')
        .eq('status', 'completed')
        .eq('user_id', userId);
        
      if (completedJobsError) throw completedJobsError;
      
      // Filter for jobs completed today
      const todayCompletedJobs = completedJobsData?.filter(job => {
        // Check if end_date is today
        if (job.end_date) {
          const jobEndDate = format(new Date(job.end_date), 'yyyy-MM-dd');
          return jobEndDate === today;
        }
        return false;
      }) || [];
      
      // Calculate additional revenue from completed jobs
      for (const job of todayCompletedJobs) {
        if (job.cost && !isNaN(parseFloat(String(job.cost)))) {
          dailyRevenue += parseFloat(String(job.cost));
          continue;
        }
        
        // Try to parse from title if no cost field
        if (job.title) {
          const pricingMatch = job.title.match(/\$(\d+(\.\d+)?)/);
          if (pricingMatch && !isNaN(parseFloat(pricingMatch[1]))) {
            dailyRevenue += parseFloat(pricingMatch[1]);
          }
        }
      }
      
      return dailyRevenue;
    } catch (error) {
      console.error('Error calculating revenue:', error);
      return 0;
    }
  };

  return {
    calculateTodayRevenue
  };
};
