
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EmailType } from "@/types/email";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";

export const useEmailFetch = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmailsByFolder = useCallback(async (
    folder: "inbox" | "sent" | "junk" = "inbox"
  ) => {
    if (!user) return [];
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }

      const response = await fetch(getEdgeFunctionUrl('email-integration'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ folder }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }

      const result = await response.json();

      if (result.emails) {
        const { data: processed } = await supabase
          .from('processed_emails')
          .select('email_id, booking_created, processing_status')
          .eq('user_id', user.id);

        return result.emails.map((email: EmailType) => {
          const processedEmail = processed?.find(p => p.email_id === email.id);
          return {
            ...email,
            booking_created: processedEmail ? processedEmail.booking_created : false,
            processing_status: processedEmail ? (processedEmail.processing_status as "pending" | "processing" | "completed" | "failed") : 'pending' as const
          };
        });
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load emails. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    isLoading,
    fetchEmailsByFolder
  };
};
