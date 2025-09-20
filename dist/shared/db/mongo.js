"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.getDb = exports.mongoConnection = exports.MongoConnection = void 0;
const mongodb_1 = require("mongodb");
const environment_1 = require("@config/environment");
const logger_1 = require("@libraries/logger");
class MongoConnection {
    static instance;
    client = null;
    db = null;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!MongoConnection.instance) {
            MongoConnection.instance = new MongoConnection();
        }
        return MongoConnection.instance;
    }
    async connect() {
        if (this.isConnected && this.client) {
            logger_1.logger.info('MongoDB already connected');
            return;
        }
        try {
            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                retryReads: true,
            };
            this.client = new mongodb_1.MongoClient(environment_1.config.database.mongoUri, options);
            await this.client.connect();
            this.db = this.client.db(environment_1.config.database.mongoDbName);
            this.isConnected = true;
            logger_1.logger.info('MongoDB connected successfully', {
                database: environment_1.config.database.mongoDbName,
                host: this.client.options.hosts?.[0]?.host,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to connect to MongoDB', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    getDb() {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }
    getClient() {
        if (!this.client) {
            throw new Error('MongoDB client not initialized. Call connect() first.');
        }
        return this.client;
    }
    isConnectionActive() {
        return this.isConnected && this.client !== null;
    }
    async disconnect() {
        if (!this.client) {
            logger_1.logger.info('MongoDB client not initialized, nothing to disconnect');
            return;
        }
        try {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.isConnected = false;
            logger_1.logger.info('MongoDB disconnected successfully');
        }
        catch (error) {
            logger_1.logger.error('Error disconnecting from MongoDB', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async gracefulShutdown() {
        logger_1.logger.info('Starting MongoDB graceful shutdown...');
        await this.disconnect();
        logger_1.logger.info('MongoDB graceful shutdown completed');
    }
}
exports.MongoConnection = MongoConnection;
exports.mongoConnection = MongoConnection.getInstance();
const getDb = () => exports.mongoConnection.getDb();
exports.getDb = getDb;
const getClient = () => exports.mongoConnection.getClient();
exports.getClient = getClient;
//# sourceMappingURL=mongo.js.map