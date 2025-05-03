
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique request ID if not already present
  const requestId = req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  
  // Record the start time to calculate duration
  const startTime = Date.now();
  
  // Extract useful request information
  const { method, url, ip } = req;
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Log the incoming request
  logger.info(`Incoming request: ${method} ${url}`, {
    requestId,
    method,
    url,
    ip,
    userAgent
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    const logData = {
      requestId,
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip
    };
    
    if (statusCode >= 500) {
      logger.error(`Request failed: ${method} ${url} ${statusCode}`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`Request failed: ${method} ${url} ${statusCode}`, logData);
    } else {
      logger.info(`Request completed: ${method} ${url} ${statusCode}`, logData);
    }
  });
  
  // Continue to the next middleware
  next();
};
