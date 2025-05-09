
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
  // In-memory credential store (for demo - in production, use a database)
  private static credentialStore: Record<string, string> = {};

  /**
   * Store email credentials securely
   */
  static async storeCredentials(userId: string, credentials: EmailCredentials): Promise<boolean> {
    try {
      const encryptedCredentials = encryptData(JSON.stringify(credentials));
      
      // In a real implementation, store in database
      // For this demo, we'll use an in-memory store
      this.credentialStore[userId] = encryptedCredentials;
      
      logger.info(`Stored credentials for user ${userId} with provider ${credentials.provider}`);
      return true;
    } catch (error) {
      logger.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve email credentials
   */
  static async getCredentials(userId: string): Promise<EmailCredentials | null> {
    try {
      // In a real implementation, retrieve from database
      const encryptedCredentials = this.credentialStore[userId];
      
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
        
        if (credentials.provider === 'google' || credentials.provider === 'gmail') {
          newTokens = await OAuthService.refreshGoogleTokens(credentials.refreshToken);
        } else if (credentials.provider === 'microsoft' || credentials.provider === 'outlook') {
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
      logger.error('Error getting valid access token:', error);
      return null;
    }
  }

  /**
   * Remove stored credentials
   */
  static async removeCredentials(userId: string): Promise<boolean> {
    try {
      // In a real implementation, remove from database
      if (this.credentialStore[userId]) {
        delete this.credentialStore[userId];
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error removing credentials:', error);
      return false;
    }
  }

  /**
   * Check if a token is valid (not expired)
   */
  static async isTokenValid(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      
      if (!credentials || !credentials.accessToken || !credentials.expiresAt) {
        return false;
      }
      
      return credentials.expiresAt > Date.now();
    } catch (error) {
      logger.error('Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Refresh token
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
      const updatedCredentials: EmailCredentials = {
        ...credentials,
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || credentials.refreshToken,
        expiresAt: Date.now() + (newTokens.expires_in * 1000)
      };
      
      return await this.storeCredentials(userId, updatedCredentials);
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return false;
    }
  }
}
