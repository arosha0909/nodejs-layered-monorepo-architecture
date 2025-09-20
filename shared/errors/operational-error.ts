/**
 * @fileoverview Custom OperationalError class for handling operational errors
 * @author Node.js Best Practices
 */

export class OperationalError extends Error {
  public readonly isOperational: boolean = true;
  public readonly statusCode: number;
  public readonly isTrusted: boolean;

  constructor(message: string, statusCode: number = 500, isTrusted: boolean = true) {
    super(message);
    this.name = 'OperationalError';
    this.statusCode = statusCode;
    this.isTrusted = isTrusted;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string): OperationalError {
    return new OperationalError(message, 400);
  }

  public static unauthorized(message: string = 'Unauthorized'): OperationalError {
    return new OperationalError(message, 401);
  }

  public static forbidden(message: string = 'Forbidden'): OperationalError {
    return new OperationalError(message, 403);
  }

  public static notFound(message: string = 'Resource not found'): OperationalError {
    return new OperationalError(message, 404);
  }

  public static conflict(message: string): OperationalError {
    return new OperationalError(message, 409);
  }

  public static unprocessableEntity(message: string): OperationalError {
    return new OperationalError(message, 422);
  }

  public static tooManyRequests(message: string = 'Too many requests'): OperationalError {
    return new OperationalError(message, 429);
  }

  public static internalServerError(message: string = 'Internal server error'): OperationalError {
    return new OperationalError(message, 500);
  }

  public static serviceUnavailable(message: string = 'Service unavailable'): OperationalError {
    return new OperationalError(message, 503);
  }
}
