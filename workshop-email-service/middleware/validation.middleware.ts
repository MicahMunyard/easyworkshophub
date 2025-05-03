
import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../utils/api-error';
import { logger } from '../utils/logger';

/**
 * Enhanced request validation middleware
 * This middleware validates incoming requests based on the request path
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = req.path.toLowerCase();
    
    // Email sending validation
    if (path.includes('/send')) {
      const { to, subject, body } = req.body;
      
      if (!to) throw new ValidationError('Recipient (to) is required');
      if (!subject) throw new ValidationError('Subject is required');
      if (!body) throw new ValidationError('Email body is required');
      
      // Validate email format
      if (typeof to === 'string') {
        validateEmail(to);
      } else if (Array.isArray(to)) {
        to.forEach(email => validateEmail(email));
      }
      
      logger.debug('Email validation passed', { 
        path, 
        to: typeof to === 'string' ? to : `${to.length} recipients`
      });
    }
    
    // Booking creation validation
    if (path.includes('/booking')) {
      const { emailId } = req.body;
      if (!emailId) throw new ValidationError('Email ID is required');
      
      logger.debug('Booking validation passed', { path, emailId });
    }
    
    // OAuth validation
    if (path.includes('/callback')) {
      const { code } = req.query;
      if (!code) throw new ValidationError('Authorization code is required');
      
      logger.debug('OAuth validation passed', { path });
    }
    
    next();
  } catch (error) {
    // Log validation errors with useful context
    logger.warn('Validation failed', { 
      path: req.path,
      method: req.method,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      body: process.env.NODE_ENV !== 'production' ? req.body : null
    });
    
    // Forward the error to the error handler middleware
    next(error);
  }
};

/**
 * Validates email format
 * @throws {ValidationError} If email format is invalid
 */
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format: ${email}`);
  }
}
