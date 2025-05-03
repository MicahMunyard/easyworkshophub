
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware
 * This middleware handles all errors thrown in the application
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error with appropriate details
  const errorDetails = {
    path: `${req.method} ${req.path}`,
    requestId: req.headers['x-request-id'] || 'unknown',
    errorId: (err as ApiError).errorId || 'system-error',
    timestamp: (err as ApiError).timestamp || new Date().toISOString(),
  };

  if (err instanceof ApiError) {
    logger.error(`API Error: ${err.message}`, { 
      ...errorDetails,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      stack: err.stack
    });
    
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        errorId: err.errorId,
        timestamp: err.timestamp
      }
    });
  }
  
  // Unhandled errors (not ApiError instances)
  logger.error(`Unhandled Error: ${err.message}`, {
    ...errorDetails,
    stack: err.stack
  });
  
  // Don't expose error details in production for non-operational errors
  return res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      errorId: errorDetails.errorId,
      timestamp: errorDetails.timestamp
    }
  });
};

/**
 * Fallback middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`);
  
  logger.warn('Route not found', {
    path: `${req.method} ${req.originalUrl}`,
    requestId: req.headers['x-request-id'] || 'unknown',
    ip: req.ip
  });
  
  next(error);
};
