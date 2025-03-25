
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
    time: string;
    customer: string;
    service: string;
    car: string;
    status: string;
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
          .from('jobs')
          .select('*')
          .in('status', ['inProgress', 'working']);
          
        if (activeJobsError) throw activeJobsError;
        
        setActiveJobsCount(activeJobsData?.length || 0);

        // Get completed jobs for today to calculate revenue from user_services table
        const { data: completedBookingsData, error: completedBookingsError } = await supabase
          .from('user_bookings')
          .select('*, user_services(price)')
          .eq('booking_date', today)
          .eq('status', 'completed')
          .eq('user_id', user.id);
          
        if (completedBookingsError) throw completedBookingsError;
        
        // Calculate revenue from completed bookings using service_id to get pricing info
        let dailyRevenue = 0;
        
        for (const booking of completedBookingsData || []) {
          // First check if we have a direct cost on the booking
          if (booking.cost && !isNaN(parseFloat(booking.cost))) {
            dailyRevenue += parseFloat(booking.cost);
            continue;
          }
          
          // Then check if we have user_services data with pricing
          if (booking.user_services && booking.user_services.price) {
            dailyRevenue += parseFloat(booking.user_services.price);
            continue;
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
          .from('jobs')
          .select('*')
          .eq('status', 'completed')
          .eq('date', today);
          
        if (completedJobsError) throw completedJobsError;
        
        // Calculate additional revenue from completed jobs
        for (const job of completedJobsData || []) {
          if (job.service) {
            const pricingMatch = job.service.match(/\$(\d+(\.\d+)?)/);
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
          .lt('in_stock', 'min_stock');
          
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
    time: appointment.booking_time,
    customer: appointment.customer_name,
    service: appointment.service,
    car: appointment.car,
    status: appointment.status || 'pending'
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
