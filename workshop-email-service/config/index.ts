
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Application configuration with validation and defaults
 */
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  // CORS configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : '*',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Email providers
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
    }
  },
  
  // Request limits
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // default 100 requests per windowMs
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  }
};

// Log configuration on startup (sanitized)
logger.info('Application configuration loaded', {
  environment: config.environment,
  port: config.port,
  allowedOrigins: config.allowedOrigins,
  jwtExpiresIn: config.jwt.expiresIn,
  googleConfigured: !!config.providers.google.clientId,
  microsoftConfigured: !!config.providers.microsoft.clientId,
  rateLimit: config.rateLimit,
  logLevel: config.logging.level
});

// Warn about insecure defaults in production
if (config.environment === 'production') {
  if (config.jwt.secret === 'default-secret-change-in-production') {
    logger.warn('Using default JWT secret in production environment - this is insecure!');
  }
}
