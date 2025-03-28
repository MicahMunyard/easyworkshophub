
import { supabase } from "@/integrations/supabase/client";

// Function to get the edge function URL
export const getEdgeFunctionUrl = (functionName: string): string => {
  // Get Supabase project URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || supabase.supabaseUrl;

  // Return the edge function URL
  return `${supabaseUrl}/functions/v1/${functionName}`;
};
