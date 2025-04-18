
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useEmailDiagnostics = (user: User | null) => {
  const diagnoseConnectionIssues = async () => {
    if (!user) {
      return "No authenticated user found. Please sign in first.";
    }
    
    try {
      const { data: existingConn, error: fetchError } = await supabase
        .from('email_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        return `Database error: ${fetchError.message}. This may be due to permission issues.`;
      }
      
      if (existingConn) {
        return "Database connection is working. You have permission to read your connection data. If you're having issues connecting email, check your credentials.";
      }
      
      try {
        console.log(`Creating test connection for user ${user.id}`);
        
        const testEmail = "test@example.com";
        const testProvider = "gmail";
        
        const { error: insertError } = await supabase
          .from('email_connections')
          .insert({
            user_id: user.id,
            email_address: testEmail,
            provider: testProvider,
            status: "testing"
          });
        
        if (insertError) {
          console.error("Insert error details:", insertError);
          
          if (insertError.code === "42501") {
            return "Permission denied. Row Level Security may be preventing insert operations.";
          } else if (insertError.code === "23505") {
            return "A connection already exists. Try disconnecting first before reconnecting.";
          }
          
          return `Failed to create test connection: ${insertError.message}. Error code: ${insertError.code}`;
        }
        
        await supabase
          .from('email_connections')
          .delete()
          .eq('user_id', user.id)
          .eq('email_address', testEmail);
        
        return "Database access is working correctly. You should be able to connect your email account.";
      } catch (error: any) {
        console.error("Detailed error during test connection:", error);
        return `Connection test error: ${error.message || "Unknown error"}. Check browser console for details.`;
      }
    } catch (error: any) {
      console.error("Diagnostic outer error:", error);
      return `Diagnostic error: ${error.message || "Unknown error"}`;
    }
  };

  return {
    diagnoseConnectionIssues
  };
};
