
import { supabase } from "@/integrations/supabase/client";

// Get the URL for a Supabase Edge Function
export const getEdgeFunctionUrl = (functionName: string): string => {
  // Get the project ref from the supabase URL
  const url = supabase.functions.url(functionName);
  return url;
};

// Get user session token for authentication
export const getUserToken = async (): Promise<string | null> => {
  const { data: sessionData, error } = await supabase.auth.getSession();
  
  if (error || !sessionData.session) {
    console.error("Error getting user session:", error);
    return null;
  }
  
  return sessionData.session.access_token;
};
