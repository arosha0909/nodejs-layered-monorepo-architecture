/**
 * @fileoverview Authentication middleware
 * @author Node.js Best Practices
 */

import { Request, Response, NextFunction } from 'express';
import { Authenticator, JWTPayload } from '@libraries/authenticator';
import { OperationalError } from '@shared/errors';
import { logger } from '@libraries/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Validates JWT token and adds user info to request
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = Authenticator.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw OperationalError.unauthorized('No token provided');
    }

    const result = Authenticator.verifyToken(token);

    if (!result.success || !result.payload) {
      throw OperationalError.unauthorized(result.error || 'Invalid token');
    }

    // Add user info to request
    req.user = result.payload;

    logger.debug('User authenticated', {
      userId: result.payload.userId,
      email: result.payload.email,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    if (error instanceof OperationalError) {
      next(error);
    } else {
      logger.error('Authentication error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      });
      next(OperationalError.unauthorized('Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't throw error if no token
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = Authenticator.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const result = Authenticator.verifyToken(token);

      if (result.success && result.payload) {
        req.user = result.payload;

        logger.debug('Optional authentication successful', {
          userId: result.payload.userId,
          email: result.payload.email,
          path: req.path,
          method: req.method,
        });
      }
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.warn('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
    });
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw OperationalError.unauthorized('Authentication required');
    }

    if (roles.length > 0 && (!req.user.role || !roles.includes(req.user.role))) {
      throw OperationalError.forbidden('Insufficient permissions');
    }

    next();
  };
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw OperationalError.unauthorized('Authentication required');
    }

    const resourceUserId = req.params[userIdParam];

    if (resourceUserId && resourceUserId !== req.user.userId) {
      throw OperationalError.forbidden('Access denied: You can only access your own resources');
    }

    next();
  };
};
