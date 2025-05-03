
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/api-error';

/**
 * Basic validation middleware
 * Can be enhanced with schema validation libraries like Joi, Zod, etc.
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
    }
    
    // Booking creation validation
    if (path.includes('/booking')) {
      const { emailId } = req.body;
      if (!emailId) throw new ValidationError('Email ID is required');
    }
    
    // OAuth validation
    if (path.includes('/callback')) {
      const { code } = req.query;
      if (!code) throw new ValidationError('Authorization code is required');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates email format
 */
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format: ${email}`);
  }
}
