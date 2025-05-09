
import { OAuthService } from './oauth.service';
import { encryptData, decryptData } from '../utils/encryption.utils';
import { logger } from '../utils/logger';

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
      logger.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Remove email credentials
   */
  static async removeCredentials(userId: string): Promise<boolean> {
    try {
      // Here you would remove the credentials from your database
      // Example: await db.collection('email_credentials').deleteOne({ userId });
      
      return true;
    } catch (error) {
      logger.error('Error removing credentials:', error);
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
      logger.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Check if the access token is still valid
   */
  static async isTokenValid(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      
      if (!credentials || !credentials.expiresAt) {
        return false;
      }
      
      // Add a 5-minute buffer
      const bufferTime = 5 * 60 * 1000;
      return (credentials.expiresAt - bufferTime) > Date.now();
    } catch (error) {
      logger.error('Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Refresh the token if needed
   */
  static async refreshToken(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      
      if (!credentials || !credentials.refreshToken) {
        return false;
      }
      
      let newTokens;
      
      if (credentials.provider === 'google' || credentials.provider === 'gmail') {
        newTokens = await OAuthService.refreshGoogleTokens(credentials.refreshToken);
      } else if (credentials.provider === 'microsoft' || credentials.provider === 'outlook') {
        newTokens = await OAuthService.refreshMicrosoftTokens(credentials.refreshToken);
      } else {
        return false;
      }
      
      // Update credentials with new tokens
      const now = Date.now();
      const updatedCredentials: EmailCredentials = {
        ...credentials,
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || credentials.refreshToken,
        expiresAt: now + (newTokens.expires_in * 1000)
      };
      
      await this.storeCredentials(userId, updatedCredentials);
      return true;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return false;
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
      if (await this.isTokenValid(userId)) {
        return credentials.accessToken || null;
      }
      
      // Token is expired, refresh it
      const refreshed = await this.refreshToken(userId);
      if (!refreshed) {
        return null;
      }
      
      // Get updated credentials
      const updatedCredentials = await this.getCredentials(userId);
      return updatedCredentials?.accessToken || null;
    } catch (error) {
      logger.error('Error getting valid access token:', error);
      return null;
    }
  }
}
