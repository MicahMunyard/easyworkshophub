
import { useState } from 'react';
import { sendgridService, EmailRecipient, SendgridEmailOptions, SendEmailResult } from '@/services/sendgridService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useSendgridEmail() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const sendEmail = async (
    to: string | EmailRecipient | Array<string | EmailRecipient>,
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> => {
    setIsSending(true);
    
    try {
      // Get workshop name from user profile or use a default
      const workshopName = user?.name || 'Workshop';
      
      const result = await sendgridService.sendEmail(
        workshopName,
        to,
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
      // Get workshop name from user profile or use a default
      const workshopName = user?.name || 'Workshop';
      
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
  
  return {
    sendEmail,
    sendMarketingCampaign,
    getWorkshopEmail: sendgridService.getWorkshopEmail,
    isConfigured: sendgridService.isConfigured(),
    isSending
  };
}
