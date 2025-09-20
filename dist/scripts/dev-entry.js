"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("@config/environment");
const logger_1 = require("@libraries/logger");
const mongo_1 = require("@shared/db/mongo");
const api_1 = __importDefault(require("@apps/orders/src/entry-points/api"));
const api_2 = __importDefault(require("@apps/users/src/entry-points/api"));
const api_3 = __importDefault(require("@apps/payments/src/entry-points/api"));
const startDevServer = async () => {
    try {
        logger_1.logger.info('Starting development server...', {
            environment: environment_1.config.app.env,
            port: environment_1.config.server.port,
        });
        await mongo_1.mongoConnection.connect();
        const ordersPort = environment_1.config.server.port;
        const usersPort = environment_1.config.server.port + 1;
        const paymentsPort = environment_1.config.server.port + 2;
        const ordersServer = api_1.default.listen(ordersPort, () => {
            logger_1.logger.info('Orders service started', { port: ordersPort });
        });
        const usersServer = api_2.default.listen(usersPort, () => {
            logger_1.logger.info('Users service started', { port: usersPort });
        });
        const paymentsServer = api_3.default.listen(paymentsPort, () => {
            logger_1.logger.info('Payments service started', { port: paymentsPort });
        });
        const gracefulShutdown = async () => {
            logger_1.logger.info('Received shutdown signal, closing servers gracefully...');
            await Promise.all([
                new Promise(resolve => ordersServer.close(() => resolve())),
                new Promise(resolve => usersServer.close(() => resolve())),
                new Promise(resolve => paymentsServer.close(() => resolve())),
            ]);
            await mongo_1.mongoConnection.gracefulShutdown();
            process.exit(0);
        };
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        logger_1.logger.info('Development server started successfully', {
            orders: `http://${environment_1.config.server.host}:${ordersPort}`,
            users: `http://${environment_1.config.server.host}:${usersPort}`,
            payments: `http://${environment_1.config.server.host}:${paymentsPort}`,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start development server', {
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
startDevServer();
//# sourceMappingURL=dev-entry.js.map