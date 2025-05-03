
/**
 * Simple logger utility
 * This could be replaced with a more robust logging solution like winston
 */
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? data : '');
    }
  },
  
  http: (message: string, req?: any) => {
    console.log(`[HTTP] ${new Date().toISOString()} - ${message}`, req ? `${req.method} ${req.url}` : '');
  }
};
