import { z } from 'zod';
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    BANK_TRANSFER = "bank_transfer",
    PAYPAL = "paypal",
    STRIPE = "stripe"
}
export declare const CreatePaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
    customerId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
}, {
    customerId: string;
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    metadata?: Record<string, any> | undefined;
    currency?: string | undefined;
    description?: string | undefined;
}>;
export declare const UpdatePaymentSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof PaymentStatus>>;
    transactionId: z.ZodOptional<z.ZodString>;
    failureReason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status?: PaymentStatus | undefined;
    metadata?: Record<string, any> | undefined;
    transactionId?: string | undefined;
    failureReason?: string | undefined;
}, {
    status?: PaymentStatus | undefined;
    metadata?: Record<string, any> | undefined;
    transactionId?: string | undefined;
    failureReason?: string | undefined;
}>;
export declare const PaymentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PaymentStatus>>;
    paymentMethod: z.ZodOptional<z.ZodNativeEnum<typeof PaymentMethod>>;
    customerId: z.ZodOptional<z.ZodString>;
    orderId: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "amount"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "updatedAt" | "amount";
    sortOrder: "asc" | "desc";
    status?: PaymentStatus | undefined;
    customerId?: string | undefined;
    orderId?: string | undefined;
    paymentMethod?: PaymentMethod | undefined;
}, {
    status?: PaymentStatus | undefined;
    customerId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "amount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    orderId?: string | undefined;
    paymentMethod?: PaymentMethod | undefined;
}>;
export declare const RefundSchema: z.ZodObject<{
    amount: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    metadata?: Record<string, any> | undefined;
    amount?: number | undefined;
}, {
    reason: string;
    metadata?: Record<string, any> | undefined;
    amount?: number | undefined;
}>;
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentDto = z.infer<typeof UpdatePaymentSchema>;
export type PaymentQueryDto = z.infer<typeof PaymentQuerySchema>;
export type RefundDto = z.infer<typeof RefundSchema>;
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
//# sourceMappingURL=payment.dto.d.ts.map