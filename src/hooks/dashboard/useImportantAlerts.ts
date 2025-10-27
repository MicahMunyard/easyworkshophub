import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  timestamp: string;
}

export const useImportantAlerts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['important-alerts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const alerts: Alert[] = [];

      // Check for overdue jobs
      const { data: overdueJobs } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['inProgress', 'working'])
        .lt('booking_date', new Date().toISOString().split('T')[0]);

      if (overdueJobs && overdueJobs.length > 0) {
        alerts.push({
          id: 'overdue-jobs',
          type: 'error',
          message: `${overdueJobs.length} job(s) are overdue and need attention`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for low stock
      const { data: lowStock } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', userId);

      const lowStockCount = lowStock?.filter(item => 
        (item.in_stock || 0) < (item.min_stock || 0)
      ).length || 0;

      if (lowStockCount > 0) {
        alerts.push({
          id: 'low-stock',
          type: 'warning',
          message: `${lowStockCount} item(s) are running low on stock`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for pending bookings today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayBookings } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('booking_date', today)
        .eq('status', 'pending');

      if (todayBookings && todayBookings.length > 0) {
        alerts.push({
          id: 'pending-bookings',
          type: 'info',
          message: `${todayBookings.length} booking(s) scheduled for today are pending confirmation`,
          timestamp: new Date().toISOString(),
        });
      }

      return alerts;
    },
    enabled: !!userId,
    refetchInterval: 60000,
  });
};
