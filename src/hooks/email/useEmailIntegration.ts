import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EmailType } from "@/types/email";
import { useEmailConnection } from "./useEmailConnection";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";

export const useEmailIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, checkConnection, connectionStatus } = useEmailConnection();
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<"inbox" | "sent" | "junk">("inbox");

  const fetchEmailsByFolder = useCallback(async (
    folder: "inbox" | "sent" | "junk" = "inbox"
  ) => {
    if (!user) return;
    setIsLoading(true);
    setCurrentFolder(folder);

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

        const updatedEmails = result.emails.map((email: EmailType) => {
          const processedEmail = processed?.find(p => p.email_id === email.id);
          return {
            ...email,
            booking_created: processedEmail ? processedEmail.booking_created : false,
            processing_status: processedEmail ? (processedEmail.processing_status as "pending" | "processing" | "completed" | "failed") : 'pending' as const
          };
        });

        setEmails(updatedEmails as EmailType[]);
      }
    } catch (error: any) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      checkConnection().then(connected => {
        if (connected) {
          fetchEmailsByFolder(currentFolder);
        } else {
          setIsLoading(false);
        }
      });
    }
  }, [user, checkConnection, fetchEmailsByFolder, currentFolder]);

  const createBookingFromEmail = async (email: EmailType): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setProcessingEmailId(email.id);
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: false,
          processing_status: 'processing' as const,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
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
        body: JSON.stringify({
          action: 'create-booking',
          emailId: email.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }
      
      const result = await response.json();
      
      if (result.success) {
        await supabase
          .from('processed_emails')
          .upsert({
            user_id: user.id,
            email_id: email.id,
            booking_created: true,
            processing_status: 'completed' as const,
            processing_notes: `Booking created with ID: ${result.bookingId || 'unknown'}`,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email_id,user_id'
          });
        
        const updatedEmails = emails.map(e => 
          e.id === email.id ? { 
            ...e, 
            booking_created: true,
            processing_status: 'completed' as const
          } : e
        );
        
        setEmails(updatedEmails);
        
        if (selectedEmail && selectedEmail.id === email.id) {
          setSelectedEmail({ 
            ...selectedEmail, 
            booking_created: true,
            processing_status: 'completed' as const
          });
        }
        
        toast({
          title: "Success",
          description: "Booking created successfully from email"
        });
        
        return true;
      }
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: false,
          processing_status: 'failed' as const,
          processing_notes: result.error || 'Failed to create booking',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      throw new Error(result.error || "Failed to create booking from email");
      
    } catch (error: any) {
      console.error("Error creating booking from email:", error);
      
      if (user) {
        await supabase
          .from('processed_emails')
          .upsert({
            user_id: user.id,
            email_id: email.id,
            booking_created: false,
            processing_status: 'failed' as const,
            processing_notes: error.message || 'Error creating booking',
            retry_count: 0,
            updated_at: new Date().toISOString()
          }, {
          onConflict: 'email_id,user_id'
        });
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create booking from email",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingEmailId(null);
    }
  };

  const replyToEmail = async (email: EmailType, replyContent: string): Promise<boolean> => {
    if (!user || !email) return false;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
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
      
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error replying to email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive"
      });
      return false;
    }
  };

  const fetchConversationThread = async (emailId: string) => {
    const thread = emails.filter(e => e.subject === (emails.find(e => e.id === emailId)?.subject));
    return thread;
  };

  return {
    emails,
    isLoading,
    selectedEmail,
    setSelectedEmail,
    processingEmailId,
    refreshEmails: () => fetchEmailsByFolder(currentFolder),
    createBookingFromEmail,
    replyToEmail,
    isConnected,
    connectionStatus,
    fetchEmailsByFolder,
    fetchConversationThread
  };
};
