
import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to properly catch and forward errors to Express error middleware
 * This reduces boilerplate try/catch blocks in route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
};
