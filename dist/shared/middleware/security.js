"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.requestLogger = exports.compressionMiddleware = exports.helmetMiddleware = exports.corsMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("@config/environment");
const logger_1 = require("@libraries/logger");
exports.corsMiddleware = (0, cors_1.default)({
    origin: environment_1.config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
exports.helmetMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
});
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6,
    threshold: 1024,
});
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
        };
        if (res.statusCode >= 400) {
            logger_1.logger.warn('HTTP Request', logData);
        }
        else {
            logger_1.logger.info('HTTP Request', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const rateLimiter = (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const clientData = requestCounts.get(clientId);
    if (!clientData || now > clientData.resetTime) {
        requestCounts.set(clientId, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        });
        next();
        return;
    }
    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        logger_1.logger.warn('Rate limit exceeded', { clientId, count: clientData.count });
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests',
                statusCode: 429,
                timestamp: new Date().toISOString(),
                path: req.path,
                method: req.method,
            },
        });
        return;
    }
    clientData.count++;
    next();
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=security.js.map