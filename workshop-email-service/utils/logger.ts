
import winston from 'winston';

/**
 * Advanced logger utility using winston
 * This replaces the simple console-based logger with a more robust solution
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'workshop-email-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Export back-compatibility functions for existing code
export const compatLogger = {
  info: (message: string, data?: any) => {
    logger.info(message, data ? data : {});
  },
  
  error: (message: string, error?: any) => {
    logger.error(message, error ? (error instanceof Error ? error : { details: error }) : {});
  },
  
  warn: (message: string, data?: any) => {
    logger.warn(message, data ? data : {});
  },
  
  debug: (message: string, data?: any) => {
    logger.debug(message, data ? data : {});
  },
  
  http: (message: string, req?: any) => {
    logger.http(message, req ? { method: req.method, url: req.url } : {});
  }
};

// For backward compatibility, make the compatLogger functions available as properties of logger
Object.assign(logger, compatLogger);
