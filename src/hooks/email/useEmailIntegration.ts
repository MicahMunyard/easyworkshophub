
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EmailType } from "@/types/email";
import { fetchMockEmails, createBookingFromEmail as createBooking } from "./services/emailService";
import { useEmailConnection } from "./useEmailConnection";

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
      const mockEmails = await fetchMockEmails();
      setEmails(mockEmails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: "Failed to load emails. Please try again.",
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
      const success = await createBooking(email);
      
      if (success) {
        // Update the email list to mark this email as having created a booking
        const updatedEmails = emails.map(e => 
          e.id === email.id ? { ...e, booking_created: true } : e
        );
        
        setEmails(updatedEmails);
        
        if (selectedEmail && selectedEmail.id === email.id) {
          setSelectedEmail({ ...selectedEmail, booking_created: true });
        }
      }
      
      return success;
      
    } catch (error) {
      console.error("Error creating booking from email:", error);
      toast({
        title: "Error",
        description: "Failed to create booking from email",
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
