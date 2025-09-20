"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalError = void 0;
class OperationalError extends Error {
    isOperational = true;
    statusCode;
    isTrusted;
    constructor(message, statusCode = 500, isTrusted = true) {
        super(message);
        this.name = 'OperationalError';
        this.statusCode = statusCode;
        this.isTrusted = isTrusted;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message) {
        return new OperationalError(message, 400);
    }
    static unauthorized(message = 'Unauthorized') {
        return new OperationalError(message, 401);
    }
    static forbidden(message = 'Forbidden') {
        return new OperationalError(message, 403);
    }
    static notFound(message = 'Resource not found') {
        return new OperationalError(message, 404);
    }
    static conflict(message) {
        return new OperationalError(message, 409);
    }
    static unprocessableEntity(message) {
        return new OperationalError(message, 422);
    }
    static tooManyRequests(message = 'Too many requests') {
        return new OperationalError(message, 429);
    }
    static internalServerError(message = 'Internal server error') {
        return new OperationalError(message, 500);
    }
    static serviceUnavailable(message = 'Service unavailable') {
        return new OperationalError(message, 503);
    }
}
exports.OperationalError = OperationalError;
//# sourceMappingURL=operational-error.js.map