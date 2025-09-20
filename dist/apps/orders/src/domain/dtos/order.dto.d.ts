import { z } from 'zod';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare const OrderItemSchema: z.ZodObject<{
    productId: z.ZodString;
    name: z.ZodString;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    productId: string;
    price: number;
    quantity: number;
    total: number;
}, {
    name: string;
    productId: string;
    price: number;
    quantity: number;
    total: number;
}>;
export declare const CreateOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        name: z.ZodString;
        price: z.ZodNumber;
        quantity: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        productId: string;
        price: number;
        quantity: number;
        total: number;
    }, {
        name: string;
        productId: string;
        price: number;
        quantity: number;
        total: number;
    }>, "many">;
    shippingAddress: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    customerId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        name: string;
        productId: string;
        price: number;
        quantity: number;
        total: number;
    }[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    customerId: string;
    notes?: string | undefined;
}, {
    items: {
        name: string;
        productId: string;
        price: number;
        quantity: number;
        total: number;
    }[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    customerId: string;
    notes?: string | undefined;
}>;
export declare const UpdateOrderSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof OrderStatus>>;
    notes: z.ZodOptional<z.ZodString>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: OrderStatus | undefined;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    notes?: string | undefined;
}, {
    status?: OrderStatus | undefined;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    notes?: string | undefined;
}>;
export declare const OrderQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof OrderStatus>>;
    customerId: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "total"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "total" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    status?: OrderStatus | undefined;
    customerId?: string | undefined;
}, {
    status?: OrderStatus | undefined;
    customerId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "total" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export type OrderQueryDto = z.infer<typeof OrderQuerySchema>;
export interface Order {
    _id?: string;
    orderNumber: string;
    customerId: string;
    items: OrderItem[];
    status: OrderStatus;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    notes?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=order.dto.d.ts.map