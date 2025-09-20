import { Request, Response, NextFunction } from 'express';
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        statusCode: number;
        timestamp: string;
        path: string;
        method: string;
        stack?: string;
    };
}
export declare const errorHandler: (error: Error, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const handleUnhandledRejection: (reason: unknown, promise: Promise<unknown>) => void;
export declare const handleUncaughtException: (error: Error) => void;
//# sourceMappingURL=error-handler.d.ts.map