
import { Request, Response, NextFunction } from 'express';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public errorId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorId = this.errorId || generateErrorId();
    Error.captureStackTrace(this, this.constructor);
  }
}

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
    stack: err.stack
  });
  
  // Default values
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let errorId = generateErrorId();
  
  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorId = err.errorId || errorId;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors (e.g., from Joi, Zod, etc.)
    statusCode = 400;
    errorMessage = err.message;
  }
  
  // Send appropriate response based on environment
  res.status(statusCode).json({
    error: errorMessage,
    errorId,
    timestamp: new Date().toISOString(),
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
