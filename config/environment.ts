/**
 * @fileoverview Centralized, hierarchical, environment-aware configuration
 * @author Node.js Best Practices
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema validation
const configSchema = z.object({
  // Application
  app: z.object({
    name: z.string().default('my-system'),
    version: z.string().default('1.0.0'),
    env: z.enum(['development', 'production', 'test']).default('development'),
  }),

  // Server
  server: z.object({
    port: z.coerce.number().min(1).max(65535).default(3000),
    host: z.string().default('localhost'),
  }),

  // Database
  database: z.object({
    mongoUri: z.string().min(1, 'MONGO_URI is required'),
    mongoDbName: z.string().min(1, 'MONGO_DB_NAME is required'),
  }),

  // Security
  security: z.object({
    jwtSecret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    jwtExpiresIn: z.string().default('7d'),
  }),

  // Logging
  logging: z.object({
    level: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    pretty: z.coerce.boolean().default(true),
  }),

  // CORS
  cors: z.object({
    origin: z.string().default('http://localhost:3000'),
  }),
});

// Parse and validate configuration
const rawConfig = {
  app: {
    name: process.env.APP_NAME,
    version: process.env.APP_VERSION,
    env: process.env.NODE_ENV,
  },
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
  },
  database: {
    mongoUri: process.env.MONGO_URI,
    mongoDbName: process.env.MONGO_DB_NAME,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  },
  logging: {
    level: process.env.LOG_LEVEL,
    pretty: process.env.LOG_PRETTY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
};

// Validate configuration
const result = configSchema.safeParse(rawConfig);

if (!result.success) {
  console.error('❌ Configuration validation failed:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const config = result.data;

// Type exports for use in other modules
export type Config = typeof config;
export type AppConfig = typeof config.app;
export type ServerConfig = typeof config.server;
export type DatabaseConfig = typeof config.database;
export type SecurityConfig = typeof config.security;
export type LoggingConfig = typeof config.logging;
export type CorsConfig = typeof config.cors;
