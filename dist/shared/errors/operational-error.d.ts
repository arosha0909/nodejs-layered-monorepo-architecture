export declare class OperationalError extends Error {
    readonly isOperational: boolean;
    readonly statusCode: number;
    readonly isTrusted: boolean;
    constructor(message: string, statusCode?: number, isTrusted?: boolean);
    static badRequest(message: string): OperationalError;
    static unauthorized(message?: string): OperationalError;
    static forbidden(message?: string): OperationalError;
    static notFound(message?: string): OperationalError;
    static conflict(message: string): OperationalError;
    static unprocessableEntity(message: string): OperationalError;
    static tooManyRequests(message?: string): OperationalError;
    static internalServerError(message?: string): OperationalError;
    static serviceUnavailable(message?: string): OperationalError;
}
//# sourceMappingURL=operational-error.d.ts.map