
import { EmailProviderInterface } from './email-provider.interface';
import { GmailEmailProvider } from './gmail-email.provider'; // Assuming you have or will create this file
import { MicrosoftEmailProvider } from './microsoft-email.provider';

/**
 * Factory for creating email provider instances
 */
export class EmailProviderFactory {
  /**
   * Create an email provider based on provider type
   * @param userId User ID
   * @param providerType Provider type (gmail, outlook, etc.)
   */
  static createProvider(userId: string, providerType: string): EmailProviderInterface {
    switch (providerType.toLowerCase()) {
      case 'gmail':
      case 'google':
        return new GmailEmailProvider(userId);
      
      case 'outlook':
      case 'microsoft':
        return new MicrosoftEmailProvider(userId);
      
      // Add support for other providers as needed
      
      default:
        throw new Error(`Unsupported email provider: ${providerType}`);
    }
  }
}
