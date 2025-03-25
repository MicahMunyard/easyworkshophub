
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  appointments: any[];
  todayBookingsCount: number;
  activeJobsCount: number;
  todayRevenue: number;
  lowStockItems: number;
  isLoading: boolean;
  formattedAppointments: {
    id: number | string;
    time: string;
    customer: string;
    service: string;
    car: string;
    status: string;
    date: string;
    duration: number;
  }[];
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayBookingsCount, setTodayBookingsCount] = useState<number>(0);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setAppointments([]);
        setTodayBookingsCount(0);
        setActiveJobsCount(0);
        setTodayRevenue(0);
        setLowStockItems(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Fetch today's bookings from user_bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('*')
          .eq('booking_date', today)
          .eq('user_id', user.id);
          
        if (bookingsError) throw bookingsError;
        
        setAppointments(bookingsData || []);
        setTodayBookingsCount(bookingsData?.length || 0);
        
        // Get active jobs (in progress or working status)
        const { data: activeJobsData, error: activeJobsError } = await supabase
          .from('user_jobs')
          .select('*')
          .in('status', ['inProgress', 'working'])
          .eq('user_id', user.id);
          
        if (activeJobsError) throw activeJobsError;
        
        setActiveJobsCount(activeJobsData?.length || 0);

        // Get completed bookings for today to calculate revenue
        const { data: completedBookingsData, error: completedBookingsError } = await supabase
          .from('user_bookings')
          .select('*')
          .eq('booking_date', today)
          .eq('status', 'completed')
          .eq('user_id', user.id);
          
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
              .eq('user_id', user.id)
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
          .eq('user_id', user.id);
          
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
        
        setTodayRevenue(dailyRevenue);
        
        // Get low stock inventory items
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('user_inventory_items')
          .select('*')
          .eq('user_id', user.id)
          .filter('in_stock', 'lt', 'min_stock');
          
        if (inventoryError) throw inventoryError;
        
        setLowStockItems(inventoryData?.length || 0);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    const intervalId = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const formattedAppointments = appointments.map(appointment => ({
    id: appointment.id,
    time: appointment.booking_time,
    customer: appointment.customer_name,
    service: appointment.service,
    car: appointment.car,
    status: appointment.status || 'pending',
    date: appointment.booking_date,
    duration: appointment.duration
  }));

  return {
    appointments,
    todayBookingsCount,
    activeJobsCount,
    todayRevenue,
    lowStockItems,
    isLoading,
    formattedAppointments
  };
};
