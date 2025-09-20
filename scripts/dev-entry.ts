/**
 * @fileoverview Development entry point for local development
 * @author Node.js Best Practices
 */

import { config } from '@config/environment';
import { logger } from '@libraries/logger';
import { mongoConnection } from '@shared/db/mongo';

// Import all services
import ordersApp from '@apps/orders/src/entry-points/api';
import usersApp from '@apps/users/src/entry-points/api';
import paymentsApp from '@apps/payments/src/entry-points/api';

const startDevServer = async (): Promise<void> => {
  try {
    logger.info('Starting development server...', {
      environment: config.app.env,
      port: config.server.port,
    });

    // Connect to database
    await mongoConnection.connect();

    // Start all services on different ports for development
    const ordersPort = config.server.port;
    const usersPort = config.server.port + 1;
    const paymentsPort = config.server.port + 2;

    // Start Orders service
    const ordersServer = ordersApp.listen(ordersPort, () => {
      logger.info('Orders service started', { port: ordersPort });
    });

    // Start Users service
    const usersServer = usersApp.listen(usersPort, () => {
      logger.info('Users service started', { port: usersPort });
    });

    // Start Payments service
    const paymentsServer = paymentsApp.listen(paymentsPort, () => {
      logger.info('Payments service started', { port: paymentsPort });
    });

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
      logger.info('Received shutdown signal, closing servers gracefully...');

      await Promise.all([
        new Promise<void>(resolve => ordersServer.close(() => resolve())),
        new Promise<void>(resolve => usersServer.close(() => resolve())),
        new Promise<void>(resolve => paymentsServer.close(() => resolve())),
      ]);

      await mongoConnection.gracefulShutdown();
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    logger.info('Development server started successfully', {
      orders: `http://${config.server.host}:${ordersPort}`,
      users: `http://${config.server.host}:${usersPort}`,
      payments: `http://${config.server.host}:${paymentsPort}`,
    });
  } catch (error) {
    logger.error('Failed to start development server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    promise: promise.toString(),
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.fatal('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Start the development server
startDevServer();
