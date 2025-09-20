/**
 * @fileoverview Orders API entry point
 * @author Node.js Best Practices
 */

import express from 'express';
import cors from 'cors';
import { config } from '@config/environment';
import { logger } from '@libraries/logger';
import { mongoConnection } from '@shared/db/mongo';
import { errorHandler, notFoundHandler, requestLogger } from '@shared/middleware';
import orderRoutes from './routes/order.routes';

const app = express();

// Security middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Orders service is healthy',
    timestamp: new Date().toISOString(),
    service: 'orders',
  });
});

// API routes
app.use('/api/orders', orderRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await mongoConnection.connect();

    // Start HTTP server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info('Orders service started', {
        port: config.server.port,
        host: config.server.host,
        environment: config.app.env,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
      logger.info('Received shutdown signal, closing server gracefully...');

      server.close(async () => {
        await mongoConnection.gracefulShutdown();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start orders service', {
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

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
