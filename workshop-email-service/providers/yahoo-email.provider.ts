
import { ImapEmailProvider, ImapConfig } from './imap-email.provider';

/**
 * Yahoo Mail specific IMAP provider
 * Requires app-specific password (not regular Yahoo password)
 */
export class YahooEmailProvider extends ImapEmailProvider {
  constructor(email: string, password: string) {
    const config: ImapConfig = {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
      email,
      password
    };
    super(config);
  }

  /**
   * Get Yahoo-specific SMTP configuration
   */
  getSmtpConfig(): { host: string; port: number; secure: boolean } {
    return {
      host: 'smtp.mail.yahoo.com',
      port: 465,
      secure: true
    };
  }

  /**
   * Yahoo-specific connection notes
   */
  static getConnectionInstructions(): string {
    return `Yahoo Mail requires an app-specific password. 
    1. Go to Yahoo Account Security settings
    2. Enable 2-step verification if not already enabled
    3. Generate an app password
    4. Use the app password here (not your regular Yahoo password)`;
  }
}
