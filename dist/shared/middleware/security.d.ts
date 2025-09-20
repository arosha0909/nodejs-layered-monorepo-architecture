import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
export declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export declare const helmetMiddleware: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const compressionMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimiter: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map