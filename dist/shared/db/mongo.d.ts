import { MongoClient, Db } from 'mongodb';
export declare class MongoConnection {
    private static instance;
    private client;
    private db;
    private isConnected;
    private constructor();
    static getInstance(): MongoConnection;
    connect(): Promise<void>;
    getDb(): Db;
    getClient(): MongoClient;
    isConnectionActive(): boolean;
    disconnect(): Promise<void>;
    gracefulShutdown(): Promise<void>;
}
export declare const mongoConnection: MongoConnection;
export declare const getDb: () => Db;
export declare const getClient: () => MongoClient;
//# sourceMappingURL=mongo.d.ts.map