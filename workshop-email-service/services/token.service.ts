
import { OAuthService } from './oauth.service';
import { encryptData, decryptData } from '../utils/encryption.utils';

interface EmailCredentials {
  provider: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
  password?: string;
  expiresAt?: number;
}

export class TokenService {
  /**
   * Store email credentials securely
   */
  static async storeCredentials(userId: string, credentials: EmailCredentials): Promise<boolean> {
    try {
      const encryptedCredentials = encryptData(JSON.stringify(credentials));
      
      // Here you would store the encrypted credentials in your database
      // Example: await db.collection('email_credentials').updateOne(
      //   { userId },
      //   { $set: { encryptedCredentials, updatedAt: new Date() } },
      //   { upsert: true }
      // );
      
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve email credentials
   */
  static async getCredentials(userId: string): Promise<EmailCredentials | null> {
    try {
      // Here you would retrieve the encrypted credentials from your database
      // Example: const result = await db.collection('email_credentials').findOne({ userId });
      // const encryptedCredentials = result?.encryptedCredentials;
      
      // For demo purposes:
      const encryptedCredentials = ''; // Placeholder
      
      if (!encryptedCredentials) {
        return null;
      }
      
      const decryptedData = decryptData(encryptedCredentials);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  static async getValidAccessToken(userId: string): Promise<string | null> {
    try {
      const credentials = await this.getCredentials(userId);
      
      if (!credentials) {
        return null;
      }
      
      // Check if token is expired
      const now = Date.now();
      if (credentials.expiresAt && credentials.expiresAt > now) {
        return credentials.accessToken || null;
      }
      
      // Token is expired, refresh it
      if (credentials.refreshToken) {
        let newTokens;
        
        if (credentials.provider === 'google') {
          newTokens = await OAuthService.refreshGoogleTokens(credentials.refreshToken);
        } else if (credentials.provider === 'microsoft') {
          newTokens = await OAuthService.refreshMicrosoftTokens(credentials.refreshToken);
        } else {
          return null;
        }
        
        // Update credentials with new tokens
        const updatedCredentials: EmailCredentials = {
          ...credentials,
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || credentials.refreshToken,
          expiresAt: now + (newTokens.expires_in * 1000)
        };
        
        await this.storeCredentials(userId, updatedCredentials);
        return updatedCredentials.accessToken || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      return null;
    }
  }
}
