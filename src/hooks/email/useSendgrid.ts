
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendgridService } from "@/services/sendgridService";
import type { SendgridFormValues } from "@/components/email-marketing/types";

export function useSendgrid() {
  const [isConfigured, setIsConfigured] = useState(sendgridService.isConfigured());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Save SendGrid configuration
   */
  const saveSendgridConfig = async (config: SendgridFormValues): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, we would save this to the database
      console.log('Saving SendGrid config:', config);
      
      // Mock successful save
      setTimeout(() => {
        setIsConfigured(true);
      }, 500);
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error saving SendGrid config');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Test SendGrid connection with provided config
   */
  const testSendgridConnection = async (config: SendgridFormValues): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would test the connection
      console.log('Testing SendGrid connection with config:', config);
      
      // Mock successful test
      return { 
        success: true, 
        message: 'Connection successful! SendGrid API is properly configured.'
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error testing SendGrid connection');
      setError(error);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send an email using SendGrid
   */
  const sendEmail = async (to: string | { email: string; name?: string }, options: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendgridService.sendEmail('Workshop', to, options);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error sending email');
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a marketing campaign to multiple recipients
   */
  const sendMarketingCampaign = async (recipients: { email: string; name?: string }[], options: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendgridService.sendMarketingCampaign('Workshop', recipients, options);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error sending campaign');
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the workshop's email address
   */
  const getWorkshopEmail = () => {
    return sendgridService.getWorkshopEmail('Workshop');
  };

  return {
    isConfigured,
    isLoading,
    error,
    sendEmail,
    sendMarketingCampaign,
    getWorkshopEmail,
    saveSendgridConfig,
    testSendgridConnection
  };
}
