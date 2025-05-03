
import { Request, Response, NextFunction } from 'express';
import { 
  ApiError, 
  ValidationError, 
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ExternalServiceError
} from '../utils/api-error';

/**
 * Generates a simple unique ID for tracking errors
 */
function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Async handler to eliminate try/catch boilerplate
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error information for server-side debugging
  console.error('Error in request:', {
    path: req.path,
    method: req.method,
    errorMessage: err.message,
    errorType: err.name,
    stack: err.stack
  });
  
  // Default values
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let errorId = generateErrorId();
  let isOperational = false;
  
  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorId = err.errorId || errorId;
    isOperational = err.isOperational;
  } else if (err.name === 'SyntaxError') {
    // Handle JSON parsing errors
    statusCode = 400;
    errorMessage = 'Invalid JSON format';
  } else if (err.name === 'ValidationError') {
    // Handle generic validation errors
    statusCode = 400;
    errorMessage = err.message;
  }
  
  // Send appropriate response based on environment
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.status(statusCode).json({
    error: errorMessage,
    errorId,
    timestamp: new Date().toISOString(),
    // Only include additional details in development
    ...(isDev && !isOperational ? { stack: err.stack } : {})
  });
};
