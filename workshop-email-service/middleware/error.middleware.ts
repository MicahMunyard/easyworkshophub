
import { Request, Response, NextFunction } from 'express';

/**
 * Generates a simple unique ID for tracking errors
 */
function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error information for server-side debugging
  console.error('Error in request:', {
    path: req.path,
    method: req.method,
    errorMessage: err.message,
    stack: err.stack
  });
  
  // Determine status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  // Generate tracking ID for this error
  const errorId = generateErrorId();
  
  // Send appropriate response based on environment
  res.status(statusCode).json({
    error: err.message,
    errorId,
    timestamp: new Date().toISOString(),
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
