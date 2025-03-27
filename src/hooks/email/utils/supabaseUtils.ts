
import { supabase } from "@/integrations/supabase/client";

// Extract the Supabase URL from the environment or use the default
export const getSupabaseUrl = (): string => {
  // Use the public Supabase URL from the client configuration
  // This works because the URL is embedded in the Supabase client
  return import.meta.env.VITE_SUPABASE_URL || "https://qyjjbpyqxwrluhymvshn.supabase.co";
};

// Get the full function URL for a specific Supabase Edge Function
export const getEdgeFunctionUrl = (functionName: string): string => {
  const baseUrl = getSupabaseUrl();
  return `${baseUrl}/functions/v1/${functionName}`;
};
