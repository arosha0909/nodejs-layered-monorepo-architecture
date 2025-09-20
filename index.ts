/**
 * @fileoverview Main application entry point
 * @author Node.js Best Practices
 */

import { config } from '@config/environment';
import { logger } from '@libraries/logger';

logger.info('Node.js Best Practices Monorepo', {
  name: config.app.name,
  version: config.app.version,
  environment: config.app.env,
});

// Export all modules for external use
export * from '@libraries/logger';
export * from '@libraries/authenticator';
export * from '@shared/errors';
export * from '@shared/middleware';
export * from '@shared/db/mongo';
export * from '@config/environment';

// Export apps
export { default as ordersApp } from '@apps/orders/src/entry-points/api';
export { default as usersApp } from '@apps/users/src/entry-points/api';
export { default as paymentsApp } from '@apps/payments/src/entry-points/api';
