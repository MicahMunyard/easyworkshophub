
import { oauthConfig } from '../config/oauth.config';
import { encryptData, decryptData } from '../utils/encryption.utils';
import { logger } from '../utils/logger';

export class OAuthService {
  // Generate Google OAuth URL for user authentication
  static getGoogleAuthUrl(): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${oauthConfig.google.clientId}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.google.redirectUri)}&scope=${encodeURIComponent(oauthConfig.google.scopes.join(' '))}&access_type=offline&prompt=consent`;
  }

  // Exchange authorization code for Google tokens
  static async getGoogleTokens(code: string): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: oauthConfig.google.clientId,
          client_secret: oauthConfig.google.clientSecret,
          redirect_uri: oauthConfig.google.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Google tokens: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      logger.error('Error exchanging Google authorization code:', error);
      throw error;
    }
  }

  // Get user email from Google API
  static async getGoogleUserEmail(accessToken: string): Promise<string> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info from Google');
      }

      const data = await response.json();
      return data.email;
    } catch (error) {
      logger.error('Error fetching Google user email:', error);
      throw error;
    }
  }

  // Generate Microsoft OAuth URL
  static getMicrosoftAuthUrl(): string {
    const baseUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    const params = new URLSearchParams({
      client_id: oauthConfig.microsoft.clientId,
      response_type: 'code',
      redirect_uri: oauthConfig.microsoft.redirectUri,
      scope: oauthConfig.microsoft.scopes.join(' '),
      response_mode: 'query'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Exchange authorization code for Microsoft tokens
  static async getMicrosoftTokens(code: string): Promise<any> {
    try {
      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: oauthConfig.microsoft.clientId,
          client_secret: oauthConfig.microsoft.clientSecret,
          code,
          redirect_uri: oauthConfig.microsoft.redirectUri,
          grant_type: 'authorization_code'
        }).toString()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Microsoft tokens: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      logger.error('Error exchanging Microsoft authorization code:', error);
      throw error;
    }
  }

  // Get user email from Microsoft Graph API
  static async getMicrosoftUserEmail(accessToken: string): Promise<string> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info from Microsoft');
      }

      const data = await response.json();
      return data.mail || data.userPrincipalName;
    } catch (error) {
      logger.error('Error fetching Microsoft user email:', error);
      throw error;
    }
  }

  // Store encrypted tokens
  static storeTokens(userId: string, provider: string, tokens: any): string {
    const encryptedTokens = encryptData(JSON.stringify(tokens));
    // This would typically be stored in your database
    return encryptedTokens;
  }

  // Retrieve and decrypt tokens
  static getTokens(encryptedTokens: string): any {
    const decryptedTokens = decryptData(encryptedTokens);
    return JSON.parse(decryptedTokens);
  }

  // Refresh Google tokens if expired
  static async refreshGoogleTokens(refreshToken: string): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: oauthConfig.google.clientId,
          client_secret: oauthConfig.google.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh Google tokens: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      logger.error('Error refreshing Google tokens:', error);
      throw error;
    }
  }

  // Refresh Microsoft tokens
  static async refreshMicrosoftTokens(refreshToken: string): Promise<any> {
    try {
      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: oauthConfig.microsoft.clientId,
          client_secret: oauthConfig.microsoft.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: oauthConfig.microsoft.scopes.join(' ')
        }).toString()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh Microsoft tokens: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      logger.error('Error refreshing Microsoft tokens:', error);
      throw error;
    }
  }

  // Revoke access to Microsoft Graph API (for disconnect)
  static async revokeMicrosoftAccess(accessToken: string): Promise<boolean> {
    try {
      // Unfortunately, Microsoft doesn't have a simple token revocation endpoint
      // The best practice is to clear the token from your database and 
      // let it expire naturally, or have the user revoke access from their account
      
      // You could also make a call to revoke specific permissions in the future
      
      // For now, we'll just return true
      return true;
    } catch (error) {
      logger.error('Error revoking Microsoft access:', error);
      return false;
    }
  }

  // Revoke access to Google APIs (for disconnect)
  static async revokeGoogleAccess(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Error revoking Google access:', error);
      return false;
    }
  }
}
