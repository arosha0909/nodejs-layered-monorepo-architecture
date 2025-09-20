import { Order, OrderQueryDto, OrderStatus } from '../../domain/dtos/order.dto';
export declare class OrderRepository {
    private collection;
    constructor();
    create(order: Omit<Order, '_id'>): Promise<Order>;
    findById(orderId: string): Promise<Order | null>;
    findByOrderNumber(orderNumber: string): Promise<Order | null>;
    findMany(query: OrderQueryDto): Promise<{
        orders: Order[];
        total: number;
    }>;
    update(orderId: string, updateData: Partial<Order>): Promise<Order>;
    delete(orderId: string): Promise<boolean>;
    getStats(customerId?: string): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        statusCounts: Record<OrderStatus, number>;
    }>;
}
//# sourceMappingURL=order.repository.d.ts.map