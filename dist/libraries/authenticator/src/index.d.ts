export interface JWTPayload {
    userId: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
}
export interface AuthResult {
    success: boolean;
    token?: string;
    payload?: JWTPayload;
    error?: string;
}
export declare class Authenticator {
    private static readonly SALT_ROUNDS;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    static verifyToken(token: string): AuthResult;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static validatePassword(password: string): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=index.d.ts.map