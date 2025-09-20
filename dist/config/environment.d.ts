export declare const config: {
    app: {
        name: string;
        version: string;
        env: "development" | "production" | "test";
    };
    server: {
        port: number;
        host: string;
    };
    database: {
        mongoUri: string;
        mongoDbName: string;
    };
    security: {
        jwtSecret: string;
        jwtExpiresIn: string;
    };
    logging: {
        level: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
        pretty: boolean;
    };
    cors: {
        origin: string;
    };
};
export type Config = typeof config;
export type AppConfig = typeof config.app;
export type ServerConfig = typeof config.server;
export type DatabaseConfig = typeof config.database;
export type SecurityConfig = typeof config.security;
export type LoggingConfig = typeof config.logging;
export type CorsConfig = typeof config.cors;
//# sourceMappingURL=environment.d.ts.map