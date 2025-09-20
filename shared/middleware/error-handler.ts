/**
 * @fileoverview Central error handler middleware
 * @author Node.js Best Practices
 */

import { Request, Response, NextFunction } from 'express';
import { OperationalError } from '@shared/errors';
import { logger } from '@libraries/logger';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
  };
}

/**
 * Central error handler middleware
 * Distinguishes between operational and catastrophic errors
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const path = req.path;
  const method = req.method;

  // Log error details
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path,
    method,
    timestamp,
    isOperational: error instanceof OperationalError ? error.isOperational : false,
  });

  // Handle operational errors (trusted errors we can safely send to client)
  if (error instanceof OperationalError && error.isTrusted) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        timestamp,
        path,
        method,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
      },
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle catastrophic errors (untrusted errors)
  // Don't leak error details to client in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment ? error.message : 'Something went wrong';
  const statusCode = error instanceof OperationalError ? error.statusCode : 500;

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp,
      path,
      method,
      ...(isDevelopment ? { stack: error.stack } : {}),
    },
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  };

  res.status(404).json(errorResponse);
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (reason: unknown, promise: Promise<unknown>): void => {
  logger.fatal('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });

  // In production, you might want to gracefully shut down the server
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (error: Error): void => {
  logger.fatal('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });

  // Always exit on uncaught exceptions
  process.exit(1);
};
