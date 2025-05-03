
/**
 * Custom API Error class for consistent error handling
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
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400 Bad Request)
 */
export class ValidationError extends ApiError {
  constructor(message: string, errorId?: string) {
    super(400, message, true, errorId);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error (401 Unauthorized)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string, errorId?: string) {
    super(401, message, true, errorId);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403 Forbidden)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string, errorId?: string) {
    super(403, message, true, errorId);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404 Not Found)
 */
export class NotFoundError extends ApiError {
  constructor(message: string, errorId?: string) {
    super(404, message, true, errorId);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (409 Conflict)
 */
export class ConflictError extends ApiError {
  constructor(message: string, errorId?: string) {
    super(409, message, true, errorId);
    this.name = 'ConflictError';
  }
}

/**
 * External service error (502 Bad Gateway)
 */
export class ExternalServiceError extends ApiError {
  constructor(message: string, errorId?: string) {
    super(502, message, true, errorId);
    this.name = 'ExternalServiceError';
  }
}
