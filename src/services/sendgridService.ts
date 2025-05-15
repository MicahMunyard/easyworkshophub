
import { EmailRecipient, SendgridEmailOptions } from '@/components/email-marketing/types';

export interface SendEmailResult {
  success: boolean;
  error?: Error;
  data?: any;
}

// Normalize recipient format for consistency
function normalizeRecipient(recipient: string | EmailRecipient | Array<string | EmailRecipient>): any {
  if (typeof recipient === 'string') {
    return { email: recipient };
  } else if (Array.isArray(recipient)) {
    return recipient.map(r => typeof r === 'string' ? { email: r } : r);
  }
  return recipient;
}

class SendgridService {
  private apiKey: string | null = null;
  private defaultSender: string | null = null;
  private defaultSenderName: string | null = null;

  // Check if SendGrid is configured
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.defaultSender);
  }

  // Configure SendGrid service
  configure(apiKey: string, sender: string, senderName: string): void {
    this.apiKey = apiKey;
    this.defaultSender = sender;
    this.defaultSenderName = senderName;
    console.log('SendGrid service configured');
  }

  // Generate a workshop email based on name
  getWorkshopEmail(workshopName: string): string {
    return this.defaultSender || `${workshopName.toLowerCase().replace(/\s+/g, '-')}@example.com`;
  }

  // Send a single email
  async sendEmail(
    workshopName: string,
    to: string | EmailRecipient | Array<string | EmailRecipient>,
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> {
    try {
      if (!this.isConfigured()) {
        console.warn('SendGrid is not configured');
        return { success: false, error: new Error('SendGrid is not configured') };
      }

      // Debug logs to track what data is being passed
      console.log('Sending email with SendGrid service:');
      console.log('- Workshop:', workshopName);
      console.log('- To:', JSON.stringify(to));
      console.log('- Options:', JSON.stringify(options));
      console.log('- Reply-To:', replyToEmail);

      const normalizedTo = normalizeRecipient(to);
      console.log('- Normalized To:', JSON.stringify(normalizedTo));

      // Ensure the to field is properly set in options
      options.to = options.to || normalizedTo;

      // Call the SendGrid Edge Function
      const response = await fetch('/api/sendgrid-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workshopName,
          options,
          replyToEmail
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SendGrid API error:', response.status, errorText);
        throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('SendGrid API success:', result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in sendEmail:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error in sendEmail')
      };
    }
  }

  // Send a marketing campaign to multiple recipients
  async sendMarketingCampaign(
    workshopName: string,
    recipients: EmailRecipient[],
    options: SendgridEmailOptions,
    replyToEmail?: string
  ): Promise<SendEmailResult> {
    try {
      if (!recipients.length) {
        return { success: false, error: new Error('No recipients provided') };
      }

      console.log(`Sending marketing campaign to ${recipients.length} recipients`);

      // Ensure the to field is set properly for a campaign
      options.to = recipients;

      return await this.sendEmail(workshopName, recipients, options, replyToEmail);
    } catch (error) {
      console.error('Error in sendMarketingCampaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error in sendMarketingCampaign')
      };
    }
  }

  // Get email analytics
  async getAnalytics(): Promise<{ success: boolean; data?: any; error?: Error }> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: new Error('SendGrid is not configured') };
      }

      // Call the analytics API endpoint
      const response = await fetch('/api/sendgrid-analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error in getAnalytics')
      };
    }
  }
}

export const sendgridService = new SendgridService();
export type { EmailRecipient, SendgridEmailOptions };
