"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnership = exports.authorize = exports.optionalAuth = exports.authenticate = void 0;
const authenticator_1 = require("@libraries/authenticator");
const errors_1 = require("@shared/errors");
const logger_1 = require("@libraries/logger");
const authenticate = (req, _res, next) => {
    try {
        const token = authenticator_1.Authenticator.extractTokenFromHeader(req.headers.authorization);
        if (!token) {
            throw errors_1.OperationalError.unauthorized('No token provided');
        }
        const result = authenticator_1.Authenticator.verifyToken(token);
        if (!result.success || !result.payload) {
            throw errors_1.OperationalError.unauthorized(result.error || 'Invalid token');
        }
        req.user = result.payload;
        logger_1.logger.debug('User authenticated', {
            userId: result.payload.userId,
            email: result.payload.email,
            path: req.path,
            method: req.method,
        });
        next();
    }
    catch (error) {
        if (error instanceof errors_1.OperationalError) {
            next(error);
        }
        else {
            logger_1.logger.error('Authentication error', {
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.path,
                method: req.method,
            });
            next(errors_1.OperationalError.unauthorized('Authentication failed'));
        }
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, _res, next) => {
    try {
        const token = authenticator_1.Authenticator.extractTokenFromHeader(req.headers.authorization);
        if (token) {
            const result = authenticator_1.Authenticator.verifyToken(token);
            if (result.success && result.payload) {
                req.user = result.payload;
                logger_1.logger.debug('Optional authentication successful', {
                    userId: result.payload.userId,
                    email: result.payload.email,
                    path: req.path,
                    method: req.method,
                });
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.warn('Optional authentication failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path,
            method: req.method,
        });
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw errors_1.OperationalError.unauthorized('Authentication required');
        }
        if (roles.length > 0 && (!req.user.role || !roles.includes(req.user.role))) {
            throw errors_1.OperationalError.forbidden('Insufficient permissions');
        }
        next();
    };
};
exports.authorize = authorize;
const requireOwnership = (userIdParam = 'userId') => {
    return (req, _res, next) => {
        if (!req.user) {
            throw errors_1.OperationalError.unauthorized('Authentication required');
        }
        const resourceUserId = req.params[userIdParam];
        if (resourceUserId && resourceUserId !== req.user.userId) {
            throw errors_1.OperationalError.forbidden('Access denied: You can only access your own resources');
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
//# sourceMappingURL=auth.js.map