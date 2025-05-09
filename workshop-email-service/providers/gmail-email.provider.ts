
import { EmailProviderInterface, EmailMessage } from './email-provider.interface';
import { TokenService } from '../services/token.service';
import { logger } from '../utils/logger';

export class GmailEmailProvider implements EmailProviderInterface {
  private userId: string;
  private accessToken: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Connect to Gmail service
   */
  async connect(): Promise<boolean> {
    try {
      // Get a valid access token
      this.accessToken = await TokenService.getValidAccessToken(this.userId);
      return !!this.accessToken;
    } catch (error) {
      logger.error('Failed to connect to Gmail service', error);
      return false;
    }
  }

  /**
   * Disconnect from Gmail service
   */
  async disconnect(): Promise<boolean> {
    // The actual OAuth token revocation would happen elsewhere
    // Here we just clear the local reference
    this.accessToken = null;
    return true;
  }

  /**
   * Fetch emails from Gmail API
   * @param limit Maximum number of emails to fetch
   */
  async fetchEmails(limit: number = 20): Promise<EmailMessage[]> {
    try {
      if (!this.accessToken) {
        await this.connect();
      }

      if (!this.accessToken) {
        throw new Error('Not connected to Gmail service');
      }

      // First, get message IDs
      const messagesResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&labelIds=INBOX`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!messagesResponse.ok) {
        throw new Error(`Gmail API error: ${messagesResponse.status}`);
      }

      const messagesData = await messagesResponse.json();
      const messages = messagesData.messages || [];

      // Fetch full details for each message
      const emailPromises = messages.map(async (message: any) => {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!messageResponse.ok) {
          logger.error(`Error fetching message ${message.id}: ${messageResponse.status}`);
          return null;
        }

        const messageData = await messageResponse.json();
        return this.processMessage(messageData);
      });

      // Get all emails and filter out any null results
      const emails = await Promise.all(emailPromises);
      return emails.filter((email): email is EmailMessage => email !== null);
    } catch (error) {
      logger.error('Failed to fetch emails from Gmail', error);
      return [];
    }
  }

  /**
   * Send an email through Gmail API
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
        throw new Error('Not connected to Gmail service');
      }

      // Prepare email in RFC 2822 format
      const email = 
        `To: ${to}\r\n` +
        `Subject: ${subject}\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n\r\n` +
        `${body}`;

      // Encode to base64url format (required by Gmail API)
      const encodedEmail = btoa(email)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send email using Gmail API
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send email: ${errorData}`);
      }

      return true;
    } catch (error) {
      logger.error('Failed to send email through Gmail', error);
      return false;
    }
  }

  /**
   * Process a Gmail API message into our application's email format
   * @param message Gmail API message object
   */
  private processMessage(message: any): EmailMessage | null {
    try {
      // Extract headers
      const headers = message.payload.headers;
      const subject = this.getHeader(headers, 'Subject') || '(No subject)';
      const from = this.getHeader(headers, 'From') || '';
      const date = this.getHeader(headers, 'Date') || new Date().toISOString();

      // Extract sender name and email
      let fromName = from;
      let senderEmail = '';

      const fromMatch = from.match(/(.+) <(.+)>/);
      if (fromMatch) {
        fromName = fromMatch[1];
        senderEmail = fromMatch[2];
      } else if (from.includes('@')) {
        fromName = from.split('@')[0];
        senderEmail = from;
      }

      // Extract email content
      const content = this.extractEmailContent(message.payload);

      // Determine if this might be a booking request
      const bookingKeywords = ['book', 'appointment', 'schedule', 'service', 'reservation'];
      const isBookingEmail = bookingKeywords.some(keyword => 
        subject.toLowerCase().includes(keyword) || 
        content.toLowerCase().includes(keyword)
      );

      // Simple booking details extraction
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
        subject,
        from: fromName,
        sender_email: senderEmail,
        date: new Date(date).toISOString(),
        content,
        is_booking_email: isBookingEmail,
        booking_created: false,
        processing_status: 'pending',
        extracted_details: extractedDetails
      };
    } catch (error) {
      logger.error('Failed to process Gmail message', error);
      return null;
    }
  }

  /**
   * Get a specific header from Gmail API headers array
   */
  private getHeader(headers: any[], name: string): string | null {
    const header = headers.find((h) => h.name === name);
    return header ? header.value : null;
  }

  /**
   * Extract email content from Gmail API message payload
   */
  private extractEmailContent(payload: any): string {
    // Check for plain parts
    if (payload.mimeType === 'text/plain' && payload.body.data) {
      return this.decodeBase64(payload.body.data);
    }

    // Check for HTML parts
    if (payload.mimeType === 'text/html' && payload.body.data) {
      return this.decodeBase64(payload.body.data);
    }

    // Handle multipart
    if (payload.parts && payload.parts.length > 0) {
      // Prefer HTML over plain text
      const htmlPart = payload.parts.find((part: any) => part.mimeType === 'text/html');
      if (htmlPart && htmlPart.body.data) {
        return this.decodeBase64(htmlPart.body.data);
      }

      // Fall back to plain text
      const plainPart = payload.parts.find((part: any) => part.mimeType === 'text/plain');
      if (plainPart && plainPart.body.data) {
        return this.decodeBase64(plainPart.body.data);
      }

      // Check for nested parts
      for (const part of payload.parts) {
        if (part.parts) {
          const content = this.extractEmailContent(part);
          if (content) return content;
        }
      }
    }

    return '(No content)';
  }

  /**
   * Decode base64 URL-safe encoded string
   */
  private decodeBase64(encoded: string): string {
    try {
      // Replace URL-safe characters and add padding if needed
      const safe = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = safe.padEnd(safe.length + (4 - safe.length % 4) % 4, '=');

      // Decode base64
      const decoded = atob(padded);

      return decoded;
    } catch (error) {
      logger.error('Error decoding base64:', error);
      return '(Error decoding message)';
    }
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
