
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom API error class with additional metadata
 * This allows for consistent error handling and response formatting
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorId: string;
  public readonly timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorId = uuidv4();
    this.timestamp = new Date().toISOString();
    
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Create a 500 Internal Server Error
   */
  static internal(message: string = "Internal Server Error"): ApiError {
    return new ApiError(500, message, false);
  }
}
