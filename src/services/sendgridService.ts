
import { supabase } from '@/integrations/supabase/client';
import { generateWorkshopEmail } from '@/integrations/sendgrid/utils';

// Types for SendGrid integration
export interface SendgridEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from_name?: string;   // Added to match the Edge Function
  from_email?: string;  // Added to match the Edge Function
  replyTo?: string; 
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  categories?: string[];
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

/**
 * Service for handling SendGrid operations at the application level
 * Uses the Supabase edge function to send emails
 */
class SendgridService {
  private domain = 'workshopbase.com.au';
  private isApiKeySet: boolean;

  constructor() {
    // Check if the edge function is configured
    this.isApiKeySet = true; // Assuming the API key is set in Supabase secrets
  }

  /**
   * Send an email from a workshop's dynamic address
   */
  async sendEmail(
    workshopName: string,
    to: string | EmailRecipient | Array<string | EmailRecipient>,
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> {
    try {
      if (!this.isApiKeySet) {
        throw new Error('SendGrid API key is not configured');
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('sendgrid-email/send', {
        body: {
          workshopName,
          options,
          replyToEmail
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      return {
        success: data.success,
        messageId: data.messageId,
        error: data.error ? new Error(data.error) : undefined
      };
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error sending email')
      };
    }
  }
  
  /**
   * Send a marketing email campaign
   */
  async sendMarketingCampaign(
    workshopName: string,
    recipients: EmailRecipient[],
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> {
    try {
      if (!this.isApiKeySet) {
        throw new Error('SendGrid API key is not configured');
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('sendgrid-email/campaign', {
        body: {
          workshopName,
          recipients,
          options,
          replyToEmail
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      return {
        success: data.success,
        messageId: data.messageId,
        error: data.error ? new Error(data.error) : undefined
      };
    } catch (error) {
      console.error('Error sending campaign via SendGrid:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error sending campaign')
      };
    }
  }
  
  /**
   * Get analytics data from SendGrid
   */
  async getAnalytics(): Promise<any> {
    try {
      if (!this.isApiKeySet) {
        throw new Error('SendGrid API key is not configured');
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('sendgrid-email/analytics', {
        body: {}
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching analytics from SendGrid:', error);
      throw error;
    }
  }
  
  /**
   * Generate an email address for a workshop
   */
  getWorkshopEmail(workshopName: string): string {
    return generateWorkshopEmail(workshopName);
  }
  
  /**
   * Check if SendGrid is properly configured
   */
  isConfigured(): boolean {
    return this.isApiKeySet;
  }
}

// Export a singleton instance
export const sendgridService = new SendgridService();
