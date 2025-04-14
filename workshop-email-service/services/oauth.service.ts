
import { oauthConfig } from '../config/oauth.config';
import { encryptData, decryptData } from '../utils/encryption.utils';

export class OAuthService {
  // Generate Google OAuth URL for user authentication
  static getGoogleAuthUrl(): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${oauthConfig.google.clientId}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.google.redirectUri)}&scope=${encodeURIComponent(oauthConfig.google.scopes.join(' '))}&access_type=offline&prompt=consent`;
  }

  // Exchange authorization code for tokens
  static async getGoogleTokens(code: string): Promise<any> {
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
      throw new Error('Failed to get Google tokens');
    }

    return response.json();
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
      throw new Error('Failed to get Microsoft tokens');
    }
    
    return response.json();
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
      throw new Error('Failed to refresh Google tokens');
    }

    return response.json();
  }

  // Refresh Microsoft tokens
  static async refreshMicrosoftTokens(refreshToken: string): Promise<any> {
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
        grant_type: 'refresh_token'
      }).toString()
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh Microsoft tokens');
    }
    
    return response.json();
  }
}
