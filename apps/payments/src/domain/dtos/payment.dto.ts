/**
 * @fileoverview Payment DTOs and validation schemas
 * @author Node.js Best Practices
 */

import { z } from 'zod';

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Payment method enum
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
}

// Create payment schema
export const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  customerId: z.string().min(1, 'Customer ID is required'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Update payment schema
export const UpdatePaymentSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  transactionId: z.string().optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Payment query schema
export const PaymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  customerId: z.string().optional(),
  orderId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'amount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Refund schema
export const RefundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.string().min(1, 'Refund reason is required'),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Type exports
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentDto = z.infer<typeof UpdatePaymentSchema>;
export type PaymentQueryDto = z.infer<typeof PaymentQuerySchema>;
export type RefundDto = z.infer<typeof RefundSchema>;

// Payment entity interface
export interface Payment {
  _id?: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  customerId: string;
  description?: string | undefined;
  transactionId?: string | undefined;
  failureReason?: string | undefined;
  metadata?: Record<string, any> | undefined;
  processedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// Payment response interface
export interface PaymentResponse {
  _id?: string | undefined;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  customerId: string;
  description?: string | undefined;
  transactionId?: string | undefined;
  failureReason?: string | undefined;
  metadata?: Record<string, any> | undefined;
  processedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// Refund entity interface
export interface Refund {
  _id?: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: PaymentStatus;
  transactionId?: string | undefined;
  metadata?: Record<string, any> | undefined;
  processedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}
