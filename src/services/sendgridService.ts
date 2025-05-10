
import { generateWorkshopEmail } from '@/integrations/sendgrid/utils';
import axios from 'axios';

// Types for SendGrid integration
export interface SendgridEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
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
 * Uses API key from environment variables - no user configuration needed
 */
class SendgridService {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';
  private domain = 'workshopbase.com.au';

  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('SendGrid API key not found in environment variables');
    }
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
      if (!this.apiKey) {
        throw new Error('SendGrid API key is not configured');
      }

      // Generate the dynamic workshop email
      const fromEmail = generateWorkshopEmail(workshopName);
      
      // Format recipients
      const recipients = Array.isArray(to) ? to : [to];
      const formattedRecipients = recipients.map(recipient => {
        if (typeof recipient === 'string') {
          return { email: recipient };
        }
        return recipient;
      });
      
      // Prepare payload
      const payload = {
        personalizations: [
          {
            to: formattedRecipients,
            subject: options.subject,
            dynamic_template_data: options.dynamicTemplateData,
          },
        ],
        from: {
          email: fromEmail,
          name: workshopName
        },
        reply_to: replyToEmail ? { email: replyToEmail } : { email: fromEmail },
        content: [
          {
            type: 'text/plain',
            value: options.text || '',
          },
        ],
        template_id: options.templateId,
        categories: options.categories,
        attachments: options.attachments,
      };
      
      // Add HTML content if provided
      if (options.html) {
        payload.content.push({
          type: 'text/html',
          value: options.html,
        });
      }
      
      // Send the request to SendGrid
      const response = await axios.post(`${this.baseUrl}/mail/send`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return {
        success: response.status >= 200 && response.status < 300,
        messageId: response.headers['x-message-id']
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
    // For marketing campaigns we use the same function but with multiple recipients
    return this.sendEmail(workshopName, recipients, options, replyToEmail);
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
    return !!this.apiKey;
  }
}

// Export a singleton instance
export const sendgridService = new SendgridService();
