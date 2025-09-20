import { z } from 'zod';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<typeof UserRole>>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: UserRole;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    isActive?: boolean | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const UserQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "firstName", "lastName", "email"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "updatedAt" | "email" | "firstName" | "lastName";
    sortOrder: "asc" | "desc";
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "email" | "firstName" | "lastName" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;
export interface User {
    _id?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
    dateOfBirth?: Date | undefined;
    isActive: boolean;
    lastLoginAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserResponse {
    _id?: string | undefined;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
    dateOfBirth?: Date | undefined;
    isActive: boolean;
    lastLoginAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginResponse {
    user: UserResponse;
    token: string;
    expiresIn: string;
}
//# sourceMappingURL=user.dto.d.ts.map