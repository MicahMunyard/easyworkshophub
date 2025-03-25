
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardData } from "./dashboard/types";
import { useAppointmentsFetch } from "./dashboard/useAppointmentsFetch";
import { useActiveJobsCount } from "./dashboard/useActiveJobsCount";
import { useRevenueCalculation } from "./dashboard/useRevenueCalculation";
import { useInventoryAlerts } from "./dashboard/useInventoryAlerts";

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayBookingsCount, setTodayBookingsCount] = useState<number>(0);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Import our custom hooks
  const { fetchTodayAppointments, formatAppointments } = useAppointmentsFetch();
  const { fetchActiveJobsCount } = useActiveJobsCount();
  const { calculateTodayRevenue } = useRevenueCalculation();
  const { fetchLowStockItems } = useInventoryAlerts();

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
        // Fetch appointments
        const bookingsData = await fetchTodayAppointments(user.id);
        setAppointments(bookingsData);
        setTodayBookingsCount(bookingsData.length);
        
        // Fetch active jobs count
        const activeJobs = await fetchActiveJobsCount(user.id);
        setActiveJobsCount(activeJobs);
        
        // Calculate revenue
        const revenue = await calculateTodayRevenue(user.id);
        setTodayRevenue(revenue);
        
        // Fetch low stock items
        const lowStock = await fetchLowStockItems(user.id);
        setLowStockItems(lowStock);
        
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

  const formattedAppointments = formatAppointments(appointments);

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
