"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderQuerySchema = exports.UpdateOrderSchema = exports.CreateOrderSchema = exports.OrderItemSchema = exports.OrderStatus = void 0;
const zod_1 = require("zod");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
exports.OrderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    name: zod_1.z.string().min(1, 'Product name is required'),
    price: zod_1.z.number().positive('Price must be positive'),
    quantity: zod_1.z.number().int().positive('Quantity must be a positive integer'),
    total: zod_1.z.number().positive('Total must be positive'),
});
exports.CreateOrderSchema = zod_1.z.object({
    items: zod_1.z.array(exports.OrderItemSchema).min(1, 'At least one item is required'),
    shippingAddress: zod_1.z.object({
        street: zod_1.z.string().min(1, 'Street is required'),
        city: zod_1.z.string().min(1, 'City is required'),
        state: zod_1.z.string().min(1, 'State is required'),
        zipCode: zod_1.z.string().min(1, 'ZIP code is required'),
        country: zod_1.z.string().min(1, 'Country is required'),
    }),
    customerId: zod_1.z.string().min(1, 'Customer ID is required'),
    notes: zod_1.z.string().optional(),
});
exports.UpdateOrderSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(OrderStatus).optional(),
    notes: zod_1.z.string().optional(),
    shippingAddress: zod_1.z
        .object({
        street: zod_1.z.string().min(1, 'Street is required'),
        city: zod_1.z.string().min(1, 'City is required'),
        state: zod_1.z.string().min(1, 'State is required'),
        zipCode: zod_1.z.string().min(1, 'ZIP code is required'),
        country: zod_1.z.string().min(1, 'Country is required'),
    })
        .optional(),
});
exports.OrderQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    status: zod_1.z.nativeEnum(OrderStatus).optional(),
    customerId: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'total']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
//# sourceMappingURL=order.dto.js.map