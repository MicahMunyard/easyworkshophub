import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWorkshopStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['workshop-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      // Get total jobs
      const { data: allJobs } = await supabase
        .from('user_bookings')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Get completed jobs
      const { data: completedJobs } = await supabase
        .from('user_bookings')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Get active technicians
      const { data: technicians } = await supabase
        .from('user_technicians')
        .select('*')
        .eq('user_id', userId);

      // Get time entries for efficiency calculation
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('*, user_bookings!inner(user_id)')
        .eq('user_bookings.user_id', userId)
        .not('end_time', 'is', null);

      // Get inventory items
      const { data: inventoryItems } = await supabase
        .from('user_inventory_items')
        .select('*')
        .eq('user_id', userId);

      // Calculate metrics
      const totalJobs = allJobs?.length || 0;
      const completedCount = completedJobs?.length || 0;
      const jobCompletionRate = totalJobs > 0 ? Math.round((completedCount / totalJobs) * 100) : 0;

      // Calculate technician efficiency (average time per job vs estimated)
      const totalDuration = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;
      const avgDuration = timeEntries?.length ? totalDuration / timeEntries.length : 0;
      const estimatedAvg = 7200; // 2 hours in seconds
      const efficiency = estimatedAvg > 0 ? Math.min(100, Math.round((estimatedAvg / Math.max(avgDuration, 1)) * 100)) : 0;

      // Calculate parts availability
      const totalItems = inventoryItems?.length || 0;
      const inStockItems = inventoryItems?.filter(item => (item.in_stock || 0) > 0).length || 0;
      const partsAvailability = totalItems > 0 ? Math.round((inStockItems / totalItems) * 100) : 100;

      // Customer satisfaction (placeholder - would need review data)
      const customerSatisfaction = 85; // Default value

      return {
        technicianEfficiency: efficiency,
        jobCompletionRate,
        customerSatisfaction,
        partsAvailability,
      };
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refetch every minute
  });
};
