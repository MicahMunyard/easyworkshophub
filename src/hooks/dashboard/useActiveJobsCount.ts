
import { supabase } from "@/integrations/supabase/client";

export const useActiveJobsCount = () => {
  const fetchActiveJobsCount = async (userId: string): Promise<number> => {
    try {
      // Get active jobs (in progress or working status)
      const { data: activeJobsData, error: activeJobsError } = await supabase
        .from('user_jobs')
        .select('*')
        .in('status', ['inProgress', 'working'])
        .eq('user_id', userId);
        
      if (activeJobsError) throw activeJobsError;
      
      return activeJobsData?.length || 0;
    } catch (error) {
      console.error('Error fetching active jobs count:', error);
      return 0;
    }
  };

  return {
    fetchActiveJobsCount
  };
};
