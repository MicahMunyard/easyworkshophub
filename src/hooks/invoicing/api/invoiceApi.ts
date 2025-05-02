
import { supabase } from "@/integrations/supabase/client";

export const fetchFinishedJobsData = async (userId: string) => {
  // Changed from status='completed' to status='finished'
  return await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'finished')
    .eq('user_id', userId);
};

export const fetchCustomerInfoForJob = async (customerName: string, userId: string) => {
  return await supabase
    .from('bookings')
    .select('email as customer_email, phone as customer_phone')
    .eq('customer', customerName)
    .eq('user_id', userId)
    .single();
};
