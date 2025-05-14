
import { useState } from 'react';
import { sendgridService, EmailRecipient, SendgridEmailOptions, SendEmailResult } from '@/services/sendgridService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useSendgridEmail() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const sendEmail = async (
    to: string | EmailRecipient | Array<string | EmailRecipient>,
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> => {
    setIsSending(true);
    
    try {
      // Get workshop name from profile, user metadata or default
      const workshopName = 
        (profile?.name) ||
        (user?.user_metadata?.name) || 
        'Workshop';
      
      // Log for debugging
      console.log("Sending email with parameters:", {
        workshopName,
        to,
        options,
        replyToEmail
      });
      
      const result = await sendgridService.sendEmail(
        workshopName,
        to, // Ensure 'to' is correctly passed
        options,
        replyToEmail
      );
      
      if (result.success) {
        toast({
          title: "Email sent successfully",
          description: "Your email has been delivered",
        });
      } else {
        toast({
          title: "Failed to send email",
          description: result.error?.message || "Please try again later",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error in useSendgridEmail:", error);
      
      toast({
        title: "Error sending email",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error")
      };
    } finally {
      setIsSending(false);
    }
  };
  
  const sendMarketingCampaign = async (
    recipients: EmailRecipient[],
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> => {
    setIsSending(true);
    
    try {
      // Get workshop name from profile, user metadata or default
      const workshopName = 
        (profile?.name) || 
        (user?.user_metadata?.name) || 
        'Workshop';
      
      // Log for debugging
      console.log("Sending marketing campaign with parameters:", {
        workshopName,
        recipients,
        options,
        replyToEmail
      });
      
      const result = await sendgridService.sendMarketingCampaign(
        workshopName,
        recipients,
        options,
        replyToEmail
      );
      
      if (result.success) {
        toast({
          title: "Campaign sent successfully",
          description: `Email campaign sent to ${recipients.length} recipients`,
        });
      } else {
        toast({
          title: "Failed to send campaign",
          description: result.error?.message || "Please try again later",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error in sendMarketingCampaign:", error);
      
      toast({
        title: "Error sending campaign",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error")
      };
    } finally {
      setIsSending(false);
    }
  };
  
  const getAnalytics = async () => {
    try {
      const result = await sendgridService.getAnalytics();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error fetching analytics",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return [];
    }
  };
  
  const getWorkshopEmail = (defaultWorkshopName: string = 'Workshop'): string => {
    const workshopName = 
      (profile?.name) || 
      (user?.user_metadata?.name) || 
      defaultWorkshopName;
      
    return sendgridService.getWorkshopEmail(workshopName);
  };
  
  return {
    sendEmail,
    sendMarketingCampaign,
    getAnalytics,
    getWorkshopEmail,
    isConfigured: sendgridService.isConfigured(),
    isSending
  };
}
