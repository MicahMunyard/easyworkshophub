
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to log incoming requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request
  logger.http(`Incoming request`, { method, url, ip });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    if (statusCode >= 400) {
      logger.warn(`${method} ${url} ${statusCode} - ${duration}ms`);
    } else {
      logger.http(`${method} ${url} ${statusCode} - ${duration}ms`);
    }
  });
  
  next();
};
