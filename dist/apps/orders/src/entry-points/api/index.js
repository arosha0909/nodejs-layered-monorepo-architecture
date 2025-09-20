"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("@config/environment");
const logger_1 = require("@libraries/logger");
const mongo_1 = require("@shared/db/mongo");
const middleware_1 = require("@shared/middleware");
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: environment_1.config.cors.origin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(middleware_1.requestLogger);
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Orders service is healthy',
        timestamp: new Date().toISOString(),
        service: 'orders',
    });
});
app.use('/api/orders', order_routes_1.default);
app.use(middleware_1.notFoundHandler);
app.use(middleware_1.errorHandler);
const startServer = async () => {
    try {
        await mongo_1.mongoConnection.connect();
        const server = app.listen(environment_1.config.server.port, environment_1.config.server.host, () => {
            logger_1.logger.info('Orders service started', {
                port: environment_1.config.server.port,
                host: environment_1.config.server.host,
                environment: environment_1.config.app.env,
            });
        });
        const gracefulShutdown = async () => {
            logger_1.logger.info('Received shutdown signal, closing server gracefully...');
            server.close(async () => {
                await mongo_1.mongoConnection.gracefulShutdown();
                process.exit(0);
            });
        };
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (error) {
        logger_1.logger.error('Failed to start orders service', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        process.exit(1);
    }
};
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.fatal('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        promise: promise.toString(),
    });
    process.exit(1);
});
process.on('uncaughtException', error => {
    logger_1.logger.fatal('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map