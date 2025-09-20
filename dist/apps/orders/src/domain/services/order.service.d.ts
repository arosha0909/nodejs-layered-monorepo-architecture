import { Order, OrderStatus, CreateOrderDto, UpdateOrderDto, OrderQueryDto } from '../dtos/order.dto';
import { OrderRepository } from '../../data-access/repositories/order.repository';
export declare class OrderService {
    private readonly orderRepository;
    constructor(orderRepository: OrderRepository);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    getOrderById(orderId: string): Promise<Order>;
    getOrders(query: OrderQueryDto): Promise<{
        orders: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateOrder(orderId: string, updateDto: UpdateOrderDto): Promise<Order>;
    cancelOrder(orderId: string, reason?: string): Promise<Order>;
    getOrderStats(customerId?: string): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        statusCounts: Record<OrderStatus, number>;
    }>;
    private generateOrderNumber;
    private isValidStatusTransition;
}
//# sourceMappingURL=order.service.d.ts.map