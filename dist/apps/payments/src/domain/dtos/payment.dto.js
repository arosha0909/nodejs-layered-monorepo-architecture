"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundSchema = exports.PaymentQuerySchema = exports.UpdatePaymentSchema = exports.CreatePaymentSchema = exports.PaymentMethod = exports.PaymentStatus = void 0;
const zod_1 = require("zod");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["STRIPE"] = "stripe";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.CreatePaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters').default('USD'),
    paymentMethod: zod_1.z.nativeEnum(PaymentMethod),
    customerId: zod_1.z.string().min(1, 'Customer ID is required'),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.UpdatePaymentSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(PaymentStatus).optional(),
    transactionId: zod_1.z.string().optional(),
    failureReason: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.PaymentQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    status: zod_1.z.nativeEnum(PaymentStatus).optional(),
    paymentMethod: zod_1.z.nativeEnum(PaymentMethod).optional(),
    customerId: zod_1.z.string().optional(),
    orderId: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'amount']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.RefundSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Refund amount must be positive').optional(),
    reason: zod_1.z.string().min(1, 'Refund reason is required'),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
//# sourceMappingURL=payment.dto.js.map