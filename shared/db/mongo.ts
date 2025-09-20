/**
 * @fileoverview MongoDB connection management with connection pooling
 * @author Node.js Best Practices
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { config } from '@config/environment';
import { logger } from '@libraries/logger';

export class MongoConnection {
  private static instance: MongoConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  /**
   * Connect to MongoDB with connection pooling
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      logger.info('MongoDB already connected');
      return;
    }

    try {
      const options: MongoClientOptions = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        // bufferMaxEntries: 0, // Not available in MongoDB driver
        // bufferCommands: false, // Not available in MongoDB driver
        retryWrites: true,
        retryReads: true,
      };

      this.client = new MongoClient(config.database.mongoUri, options);

      await this.client.connect();
      this.db = this.client.db(config.database.mongoDbName);
      this.isConnected = true;

      logger.info('MongoDB connected successfully', {
        database: config.database.mongoDbName,
        host: this.client.options.hosts?.[0]?.host,
      });
    } catch (error) {
      logger.error('Failed to connect to MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get database instance
   */
  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get MongoDB client
   */
  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoDB client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if connected
   */
  public isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.client) {
      logger.info('MongoDB client not initialized, nothing to disconnect');
      return;
    }

    try {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  public async gracefulShutdown(): Promise<void> {
    logger.info('Starting MongoDB graceful shutdown...');
    await this.disconnect();
    logger.info('MongoDB graceful shutdown completed');
  }
}

// Export singleton instance
export const mongoConnection = MongoConnection.getInstance();

// Helper function to get database instance
export const getDb = (): Db => mongoConnection.getDb();

// Helper function to get client
export const getClient = (): MongoClient => mongoConnection.getClient();
