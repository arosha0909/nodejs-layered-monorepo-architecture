"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUncaughtException = exports.handleUnhandledRejection = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("@shared/errors");
const logger_1 = require("@libraries/logger");
const errorHandler = (error, req, res, _next) => {
    const timestamp = new Date().toISOString();
    const path = req.path;
    const method = req.method;
    logger_1.logger.error('Error occurred', {
        error: error.message,
        stack: error.stack,
        path,
        method,
        timestamp,
        isOperational: error instanceof errors_1.OperationalError ? error.isOperational : false,
    });
    if (error instanceof errors_1.OperationalError && error.isTrusted) {
        const errorResponse = {
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
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment ? error.message : 'Something went wrong';
    const statusCode = error instanceof errors_1.OperationalError ? error.statusCode : 500;
    const errorResponse = {
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
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const errorResponse = {
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
exports.notFoundHandler = notFoundHandler;
const handleUnhandledRejection = (reason, promise) => {
    logger_1.logger.fatal('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: promise.toString(),
    });
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
};
exports.handleUnhandledRejection = handleUnhandledRejection;
const handleUncaughtException = (error) => {
    logger_1.logger.fatal('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
};
exports.handleUncaughtException = handleUncaughtException;
//# sourceMappingURL=error-handler.js.map