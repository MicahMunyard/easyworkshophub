
import { useState, useEffect, useCallback } from "react";
import { EmailType } from "@/types/email";
import { useEmailConnection } from "./useEmailConnection";
import { useEmailFetch } from "./useEmailFetch";
import { useEmailBooking } from "./useEmailBooking";
import { useEmailConversation } from "./useEmailConversation";
import { supabase } from "@/integrations/supabase/client";

export const useEmailIntegration = () => {
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);
  const { isConnected, checkConnection, connectionStatus } = useEmailConnection();
  const { isLoading, fetchEmailsByFolder } = useEmailFetch();
  const { processingEmailId, createBookingFromEmail } = useEmailBooking();
  const { fetchConversationThread } = useEmailConversation();

  const refreshEmails = useCallback(async () => {
    const fetchedEmails = await fetchEmailsByFolder("inbox");
    setEmails(fetchedEmails);
  }, [fetchEmailsByFolder]);
  
  // Auto-load emails when the component mounts if connected
  useEffect(() => {
    if (isConnected) {
      refreshEmails();
    }
  }, [isConnected, refreshEmails]);

  const replyToEmail = async (email: EmailType, replyContent: string): Promise<boolean> => {
    if (!email) return false;
    
    try {
      const response = await supabase.functions.invoke('email-integration/send-reply', {
        method: 'POST',
        body: {
          to: email.sender_email,
          subject: `Re: ${email.subject}`,
          body: replyContent
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to send reply");
      }
      
      return true;
    } catch (error: any) {
      console.error("Error replying to email:", error);
      return false;
    }
  };

  return {
    emails,
    isLoading,
    selectedEmail,
    setSelectedEmail,
    processingEmailId,
    refreshEmails,
    createBookingFromEmail,
    replyToEmail,
    isConnected,
    connectionStatus,
    fetchEmailsByFolder,
    fetchConversationThread
  };
};
