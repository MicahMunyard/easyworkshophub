
import { EmailProviderInterface, EmailMessage } from './email-provider.interface';
import { TokenService } from '../services/token.service';
import { logger } from '../utils/logger';

export class MicrosoftEmailProvider implements EmailProviderInterface {
  private userId: string;
  private accessToken: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Connect to Microsoft email service
   */
  async connect(): Promise<boolean> {
    try {
      // Get a valid access token
      this.accessToken = await TokenService.getValidAccessToken(this.userId);
      return !!this.accessToken;
    } catch (error) {
      logger.error('Failed to connect to Microsoft email service', error);
      return false;
    }
  }

  /**
   * Disconnect from Microsoft email service
   */
  async disconnect(): Promise<boolean> {
    // The actual OAuth token revocation would happen elsewhere
    // Here we just clear the local reference
    this.accessToken = null;
    return true;
  }

  /**
   * Fetch emails from Microsoft Graph API
   * @param limit Maximum number of emails to fetch
   */
  async fetchEmails(limit: number = 20): Promise<EmailMessage[]> {
    try {
      if (!this.accessToken) {
        await this.connect();
      }

      if (!this.accessToken) {
        throw new Error('Not connected to Microsoft email service');
      }

      // Fetch emails from Microsoft Graph API
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=${limit}&$orderby=receivedDateTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.status}`);
      }

      const data = await response.json();
      const messages = data.value || [];

      // Process and convert Microsoft email format to our application's format
      return messages.map((message: any) => this.processMessage(message));
    } catch (error) {
      logger.error('Failed to fetch emails from Microsoft', error);
      return [];
    }
  }

  /**
   * Send an email through Microsoft Graph API
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Email body (can be HTML)
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.connect();
      }

      if (!this.accessToken) {
        throw new Error('Not connected to Microsoft email service');
      }

      // Prepare email message in Microsoft Graph format
      const message = {
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: body,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
        saveToSentItems: true,
      };

      // Send email using Microsoft Graph API
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send email: ${errorData}`);
      }

      return true;
    } catch (error) {
      logger.error('Failed to send email through Microsoft', error);
      return false;
    }
  }

  /**
   * Process a Microsoft Graph API message into our application's email format
   * @param message Microsoft Graph API message object
   */
  private processMessage(message: any): EmailMessage {
    // Extract message details
    const fromName = message.from?.emailAddress?.name || '';
    const fromEmail = message.from?.emailAddress?.address || '';
    const content = message.body?.content || '';
    const receivedDate = message.receivedDateTime || new Date().toISOString();

    // Determine if this might be a booking request
    // This is a simple heuristic - in a real implementation, use NLP
    const bookingKeywords = ['book', 'appointment', 'schedule', 'service', 'reservation'];
    const isBookingEmail = bookingKeywords.some(keyword => 
      message.subject?.toLowerCase().includes(keyword) || 
      content.toLowerCase().includes(keyword)
    );

    // Simple booking details extraction
    // In a real implementation, use a proper NLP service
    let extractedDetails = null;
    if (isBookingEmail) {
      extractedDetails = {
        name: fromName,
        phone: this.extractPhoneNumber(content),
        date: this.extractDate(content),
        time: this.extractTime(content),
        service: this.extractService(content),
        vehicle: this.extractVehicle(content)
      };
    }

    return {
      id: message.id,
      subject: message.subject || '(No subject)',
      from: fromName,
      sender_email: fromEmail,
      date: receivedDate,
      content: content,
      is_booking_email: isBookingEmail,
      booking_created: false,
      processing_status: 'pending',
      extracted_details: extractedDetails
    };
  }

  // Simple extractors (very basic implementations)
  private extractPhoneNumber(text: string): string | null {
    const phoneRegex = /(\+?[0-9]{1,4}[ .-]?)?(\(?\d{3,4}\)?[ .-]?)?\d{3}[ .-]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
  }

  private extractDate(text: string): string | null {
    // Simple date patterns
    const patterns = [
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/, // MM/DD/YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?(\s*,\s*\d{4})?\b/i, // Month Day
      /\b(next|this)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i, // Relative day
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }

  private extractTime(text: string): string | null {
    const timeRegex = /\b(\d{1,2}):(\d{2})(\s*(am|pm))?\b/i;
    const match = text.match(timeRegex);
    return match ? match[0] : null;
  }

  private extractService(text: string): string | null {
    const serviceTypes = [
      'oil change', 'brake', 'tire', 'inspection', 'tune up', 
      'maintenance', 'repair', 'service'
    ];
    
    const lowerText = text.toLowerCase();
    for (const service of serviceTypes) {
      if (lowerText.includes(service)) {
        // Try to get context around the service
        const pattern = new RegExp(`[\\w\\s]{0,20}${service}[\\w\\s]{0,20}`, 'i');
        const match = text.match(pattern);
        return match ? match[0].trim() : service;
      }
    }
    
    return null;
  }

  private extractVehicle(text: string): string | null {
    const carBrands = [
      'toyota', 'honda', 'ford', 'chevrolet', 'bmw', 'audi', 'mercedes', 
      'hyundai', 'kia', 'subaru', 'nissan', 'lexus', 'mazda', 'volkswagen'
    ];
    
    const lowerText = text.toLowerCase();
    for (const brand of carBrands) {
      if (lowerText.includes(brand)) {
        // Try to get model info
        const brandRegex = new RegExp(`${brand}[\\w\\s-]{1,15}`, 'i');
        const match = text.match(brandRegex);
        return match ? match[0].trim() : brand;
      }
    }
    
    return null;
  }
}
