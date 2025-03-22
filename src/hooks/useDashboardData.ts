
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
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('*')
          .eq('booking_date', today)
          .eq('user_id', user.id);
          
        if (bookingsError) throw bookingsError;
        
        setAppointments(bookingsData || []);
        setTodayBookingsCount(bookingsData?.length || 0);
        
        const revenue = bookingsData?.reduce((sum, booking) => sum + (booking.cost || 0), 0) || 0;
        setTodayRevenue(revenue);
        
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'inProgress');
          
        if (jobsError) throw jobsError;
        
        setActiveJobsCount(jobsData?.length || 0);
        
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
