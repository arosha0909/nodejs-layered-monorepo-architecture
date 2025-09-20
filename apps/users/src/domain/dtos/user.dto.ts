/**
 * @fileoverview User DTOs and validation schemas
 * @author Node.js Best Practices
 */

import { z } from 'zod';

// User role enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// Create user schema
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});

// Update user schema
export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// User query schema
export const UserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;

// User entity interface
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

// User response interface (without password)
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

// Login response interface
export interface LoginResponse {
  user: UserResponse;
  token: string;
  expiresIn: string;
}
