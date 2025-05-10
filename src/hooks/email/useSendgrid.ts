
import { useState, useCallback } from 'react';
import { sendgridService, SendgridEmailOptions, EmailRecipient, SendEmailResult } from '@/services/sendgridService';
import { useToast } from '@/hooks/use-toast';
import { useWorkshop } from '@/hooks/useWorkshop'; // Custom hook to get workshop info

export function useSendgrid() {
  const { toast } = useToast();
  const { workshop } = useWorkshop(); // Get current workshop info
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if SendGrid is configured at the application level
  const isConfigured = sendgridService.isConfigured();
  
  /**
   * Send an email using the current workshop's identity
   */
  const sendEmail = useCallback(async (
    to: string | EmailRecipient | Array<string | EmailRecipient>,
    options: SendgridEmailOptions
  ): Promise<SendEmailResult> => {
    if (!workshop?.name) {
      const error = new Error('Workshop information not available');
      return { success: false, error };
    }
    
    if (!isConfigured) {
      const error = new Error('SendGrid is not configured');
      return { success: false, error };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await sendgridService.sendEmail(
        workshop.name,
        to,
        options,
        workshop.email // Use workshop email as reply-to if available
      );
      
      if (!result.success) {
        throw result.error || new Error('Failed to send email');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error sending email');
      setError(error);
      
      toast({
        title: 'Failed to send email',
        description: error.message,
        variant: 'destructive',
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [workshop, isConfigured, toast]);
  
  /**
   * Send a marketing campaign to multiple recipients
   */
  const sendMarketingCampaign = useCallback(async (
    recipients: EmailRecipient[],
    options: SendgridEmailOptions
  ): Promise<SendEmailResult> => {
    if (!workshop?.name) {
      const error = new Error('Workshop information not available');
      return { success: false, error };
    }
    
    if (!isConfigured) {
      const error = new Error('SendGrid is not configured');
      return { success: false, error };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await sendgridService.sendMarketingCampaign(
        workshop.name,
        recipients,
        options,
        workshop.email // Use workshop email as reply-to if available
      );
      
      if (result.success) {
        toast({
          title: 'Campaign sent successfully',
          description: `Email campaign was sent to ${recipients.length} recipients`,
        });
      } else {
        throw result.error || new Error('Failed to send marketing campaign');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error sending campaign');
      setError(error);
      
      toast({
        title: 'Failed to send marketing campaign',
        description: error.message,
        variant: 'destructive',
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [workshop, isConfigured, toast]);
  
  /**
   * Get the workshop's email address
   */
  const getWorkshopEmail = useCallback((): string => {
    if (!workshop?.name) {
      return '';
    }
    return sendgridService.getWorkshopEmail(workshop.name);
  }, [workshop]);
  
  return {
    isConfigured,
    isLoading,
    error,
    sendEmail,
    sendMarketingCampaign,
    getWorkshopEmail
  };
}
