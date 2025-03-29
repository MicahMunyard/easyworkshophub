
import { supabase } from "@/integrations/supabase/client";

// Function to get the edge function URL
export const getEdgeFunctionUrl = (functionName: string): string => {
  // Get Supabase project URL from environment variable or use the hardcoded fallback URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    "https://qyjjbpyqxwrluhymvshn.supabase.co";

  // Return the edge function URL
  return `${supabaseUrl}/functions/v1/${functionName}`;
};
