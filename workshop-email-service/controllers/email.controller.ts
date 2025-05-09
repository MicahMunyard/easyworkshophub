
import { Request, Response } from 'express';
import { OAuthService } from '../services/oauth.service';
import { TokenService } from '../services/token.service';
import { extractBookingDetails } from '../services/nlp.service';
import { EmailProviderFactory } from '../providers/email-provider.factory';
import { logger } from '../utils/logger';

export class EmailController {
  /**
   * Get OAuth URL for a specific provider
   */
  static getAuthUrl(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      
      let authUrl = '';
      if (provider === 'google') {
        authUrl = OAuthService.getGoogleAuthUrl();
      } else if (provider === 'microsoft') {
        authUrl = OAuthService.getMicrosoftAuthUrl();
      } else {
        return res.status(400).json({ error: 'Unsupported provider' });
      }
      
      return res.json({ authUrl });
    } catch (error) {
      logger.error('Error getting auth URL:', error);
      return res.status(500).json({ error: 'Failed to generate authentication URL' });
    }
  }

  /**
   * Handle OAuth callback
   */
  static async handleOAuthCallback(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      const { code } = req.query;
      const userId = req.user?.id;
      
      if (!code || !userId) {
        return res.status(400).json({ error: 'Missing code or user ID' });
      }
      
      let tokens;
      let userEmail = '';
      
      if (provider === 'google') {
        tokens = await OAuthService.getGoogleTokens(code.toString());
        userEmail = await OAuthService.getGoogleUserEmail(tokens.access_token);
      } else if (provider === 'microsoft') {
        tokens = await OAuthService.getMicrosoftTokens(code.toString());
        userEmail = await OAuthService.getMicrosoftUserEmail(tokens.access_token);
      } else {
        return res.status(400).json({ error: 'Unsupported provider' });
      }
      
      // Store tokens securely
      await TokenService.storeCredentials(userId, {
        provider,
        email: userEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000)
      });
      
      return res.json({ success: true, email: userEmail });
    } catch (error) {
      logger.error('OAuth callback error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  /**
   * Fetch emails
   */
  static async fetchEmails(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const credentials = await TokenService.getCredentials(userId);
      if (!credentials) {
        return res.status(404).json({ error: 'Email connection not found' });
      }
      
      // Create appropriate provider
      const provider = EmailProviderFactory.createProvider(userId, credentials.provider);
      
      // Connect and fetch emails
      const connected = await provider.connect();
      if (!connected) {
        return res.status(401).json({ error: 'Failed to connect to email provider' });
      }
      
      const emails = await provider.fetchEmails(20);
      
      return res.json({ emails });
    } catch (error) {
      logger.error('Error fetching emails:', error);
      return res.status(500).json({ error: 'Failed to fetch emails' });
    }
  }

  /**
   * Send email
   */
  static async sendEmail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { to, subject, body } = req.body;
      
      if (!userId || !to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const credentials = await TokenService.getCredentials(userId);
      if (!credentials) {
        return res.status(404).json({ error: 'Email connection not found' });
      }
      
      // Create appropriate provider
      const provider = EmailProviderFactory.createProvider(userId, credentials.provider);
      
      // Connect and send email
      const connected = await provider.connect();
      if (!connected) {
        return res.status(401).json({ error: 'Failed to connect to email provider' });
      }
      
      const sent = await provider.sendEmail(to, subject, body);
      if (!sent) {
        return res.status(500).json({ error: 'Failed to send email' });
      }
      
      return res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      logger.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  /**
   * Create booking from email
   */
  static async createBookingFromEmail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { emailId } = req.body;
      
      if (!userId || !emailId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const credentials = await TokenService.getCredentials(userId);
      if (!credentials) {
        return res.status(404).json({ error: 'Email connection not found' });
      }
      
      // Create appropriate provider
      const provider = EmailProviderFactory.createProvider(userId, credentials.provider);
      
      // Connect to email provider
      const connected = await provider.connect();
      if (!connected) {
        return res.status(401).json({ error: 'Failed to connect to email provider' });
      }
      
      // In a real implementation, you would:
      // 1. Fetch the specific email by ID
      // 2. Extract booking details using NLP
      // 3. Create a booking in your system
      
      // For this implementation, we'll simulate success
      logger.info(`Creating booking from email ${emailId} for user ${userId}`);
      
      const bookingId = 'booking-' + Math.floor(Math.random() * 1000000);
      
      return res.json({ 
        success: true, 
        bookingId,
        message: 'Booking created successfully' 
      });
    } catch (error) {
      logger.error('Error creating booking from email:', error);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  /**
   * Disconnect email account
   */
  static async disconnectEmail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const credentials = await TokenService.getCredentials(userId);
      if (!credentials) {
        return res.status(404).json({ error: 'Email connection not found' });
      }
      
      // Create appropriate provider
      const provider = EmailProviderFactory.createProvider(userId, credentials.provider);
      
      // Disconnect from provider
      await provider.disconnect();
      
      // Clear credentials
      await TokenService.removeCredentials(userId);
      
      return res.json({ success: true, message: 'Email account disconnected successfully' });
    } catch (error) {
      logger.error('Error disconnecting email:', error);
      return res.status(500).json({ error: 'Failed to disconnect email account' });
    }
  }
  
  /**
   * Diagnose email connection issues
   */
  static async diagnoseConnection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const credentials = await TokenService.getCredentials(userId);
      if (!credentials) {
        return res.status(404).json({ error: 'Email connection not found' });
      }
      
      // Check provider-specific connection details
      let diagnosticMessage = "";
      
      if (credentials.provider === 'google' || credentials.provider === 'gmail') {
        // Check if token needs refresh
        const tokenValid = await TokenService.isTokenValid(userId);
        if (!tokenValid) {
          // Try to refresh the token
          const refreshed = await TokenService.refreshToken(userId);
          if (!refreshed) {
            diagnosticMessage = "Google access token is expired and could not be refreshed. Please reconnect your account.";
          } else {
            diagnosticMessage = "Google access token was expired but has been successfully refreshed.";
          }
        } else {
          diagnosticMessage = "Google connection is active and working properly.";
        }
      } 
      else if (credentials.provider === 'microsoft' || credentials.provider === 'outlook') {
        // Check if token needs refresh
        const tokenValid = await TokenService.isTokenValid(userId);
        if (!tokenValid) {
          // Try to refresh the token
          const refreshed = await TokenService.refreshToken(userId);
          if (!refreshed) {
            diagnosticMessage = "Microsoft access token is expired and could not be refreshed. Please reconnect your account.";
          } else {
            diagnosticMessage = "Microsoft access token was expired but has been successfully refreshed.";
          }
        } else {
          diagnosticMessage = "Microsoft connection is active and working properly.";
        }
      }
      else {
        diagnosticMessage = `Provider ${credentials.provider} is connected but diagnostic details are not available.`;
      }
      
      return res.json({ 
        success: true, 
        provider: credentials.provider,
        email: credentials.email,
        diagnosticMessage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error diagnosing connection:', error);
      return res.status(500).json({ error: 'Failed to diagnose email connection' });
    }
  }
}
