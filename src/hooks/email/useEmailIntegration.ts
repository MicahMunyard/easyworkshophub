import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EmailType } from "@/types/email";
import { useEmailConnection } from "./useEmailConnection";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";

export const useEmailIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, checkConnection } = useEmailConnection();
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);

  useEffect(() => {
    if (user) {
      checkConnection().then(connected => {
        if (connected) {
          fetchEmails();
        } else {
          setIsLoading(false);
        }
      });
    }
  }, [user]);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      // Get the user's session token for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(getEdgeFunctionUrl('email-integration/fetch'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }
      
      const result = await response.json();
      
      if (result.emails) {
        // Check which emails have already been processed
        const processedEmails = new Set<string>();
        
        const { data: processed } = await supabase
          .from('processed_emails')
          .select('email_id, booking_created')
          .eq('user_id', user?.id);
        
        if (processed) {
          processed.forEach(item => {
            processedEmails.add(item.email_id);
          });
        }
        
        // Update booking_created status based on processed emails data
        const updatedEmails = result.emails.map(email => {
          const processedEmail = processed?.find(p => p.email_id === email.id);
          return {
            ...email,
            booking_created: processedEmail ? processedEmail.booking_created : false
          };
        });
        
        setEmails(updatedEmails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEmails = () => {
    fetchEmails();
  };

  const createBookingFromEmail = async (email: EmailType): Promise<boolean> => {
    try {
      // Get the user's session token for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(getEdgeFunctionUrl('email-integration/create-booking'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          emailId: email.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update the email list to mark this email as having created a booking
        const updatedEmails = emails.map(e => 
          e.id === email.id ? { ...e, booking_created: true } : e
        );
        
        setEmails(updatedEmails);
        
        if (selectedEmail && selectedEmail.id === email.id) {
          setSelectedEmail({ ...selectedEmail, booking_created: true });
        }
        
        toast({
          title: "Success",
          description: "Booking created successfully from email"
        });
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error("Error creating booking from email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking from email",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    emails,
    isLoading,
    selectedEmail,
    setSelectedEmail,
    refreshEmails,
    createBookingFromEmail,
    isConnected
  };
};
