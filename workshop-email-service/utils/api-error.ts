
/**
 * Custom API error class
 * Provides consistent error structure with HTTP status codes for API responses
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorId: string;
  timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorId = generateErrorId();
    this.timestamp = new Date().toISOString();

    // Ensures proper stack trace for debugging (preserves proper error prototype chain)
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Creates a validation-specific error
   */
  static validation(message: string): ApiError {
    return new ApiError(400, message);
  }

  /**
   * Creates an authentication-specific error
   */
  static authentication(message: string = 'Authentication failed'): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Creates an authorization-specific error
   */
  static authorization(message: string = 'Permission denied'): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Creates a not-found-specific error
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Creates a conflict-specific error
   */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Creates a server-specific error
   */
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}

/**
 * Extends ValidationError to specifically handle validation errors
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Generates a unique error ID for tracing
 */
function generateErrorId(): string {
  return Math.random().toString(36).substring(2, 15);
}
