
import axios from "axios";
import { EmailRecipient, SendgridEmailOptions } from "@/components/email-marketing/types";

export interface SendEmailResult {
  success: boolean;
  error?: Error;
}

class SendgridService {
  private supabaseUrl: string;
  
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  }
  
  /**
   * Checks if SendGrid is configured
   */
  isConfigured(): boolean {
    // This would normally check if we have API keys, etc.
    // For now, return true for development purposes
    return true;
  }
  
  /**
   * Sends an email using the SendGrid Edge Function
   * @param workshopName The name of the workshop
   * @param recipient The recipient of the email
   * @param options Email options including subject, content, etc.
   * @param replyToEmail Optional reply-to email address
   * @returns Promise with the result of the email send operation
   */
  async sendEmail(
    workshopName: string,
    recipient: EmailRecipient | string,
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> {
    try {
      if (!this.supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }
      
      // Format recipient if it's a string
      const formattedRecipient = typeof recipient === 'string' 
        ? { email: recipient, name: recipient.split('@')[0] } 
        : recipient;
      
      // Debug logs
      console.log('Sending email with recipient:', JSON.stringify(formattedRecipient, null, 2));
      console.log('Email options:', JSON.stringify(options, null, 2));
      
      // Call SendGrid Edge Function with proper parameters
      const response = await fetch(`${this.supabaseUrl}/functions/v1/sendgrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workshopName,
          to: formattedRecipient,  // Pass formatted recipient
          options,                 // Pass all options
          replyToEmail             // Pass reply-to email
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to send email`);
      }
      
      const result = await response.json();
      return { success: true };
      
    } catch (error) {
      console.error('SendGrid service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error sending email')
      };
    }
  }

  /**
   * Sends a marketing campaign to multiple recipients
   */
  async sendMarketingCampaign(
    workshopName: string,
    recipients: EmailRecipient[],
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> {
    try {
      if (!this.supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }
      
      // Debug logs
      console.log('Sending marketing campaign to recipients:', recipients.length);
      
      // Call SendGrid Edge Function with proper parameters
      const response = await fetch(`${this.supabaseUrl}/functions/v1/sendgrid-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workshopName,
          recipients,
          options,
          replyToEmail
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to send campaign`);
      }
      
      const result = await response.json();
      return { success: true };
      
    } catch (error) {
      console.error('SendGrid marketing campaign error:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error sending marketing campaign')
      };
    }
  }

  /**
   * Get the workshop's email address
   */
  getWorkshopEmail(workshopName: string): string {
    // This is a simplified implementation
    return `noreply@${workshopName.toLowerCase().replace(/\s+/g, '-')}.com`;
  }
}

export const sendgridService = new SendgridService();
