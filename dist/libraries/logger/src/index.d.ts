import pino from 'pino';
export interface LoggerConfig {
    level: string;
    pretty: boolean;
    service: string;
}
export declare class Logger {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): Logger;
    info(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
    fatal(message: string, meta?: Record<string, unknown>): void;
    trace(message: string, meta?: Record<string, unknown>): void;
    child(bindings: Record<string, unknown>): pino.Logger;
}
export declare const logger: Logger;
//# sourceMappingURL=index.d.ts.map