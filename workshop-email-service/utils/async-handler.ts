
import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to eliminate try/catch boilerplate
 * @param fn The async function to wrap
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
