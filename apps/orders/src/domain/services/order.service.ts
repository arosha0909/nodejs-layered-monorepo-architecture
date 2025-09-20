/**
 * @fileoverview Order domain service - core business logic
 * @author Node.js Best Practices
 */

import {
  Order,
  OrderStatus,
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
} from '../dtos/order.dto';
import { OrderRepository } from '../../data-access/repositories/order.repository';
import { OperationalError } from '@shared/errors';
import { logger } from '@libraries/logger';

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Create a new order
   */
  public async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Calculate totals
      const subtotal = createOrderDto.items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      const order: Omit<Order, '_id'> = {
        orderNumber,
        customerId: createOrderDto.customerId,
        items: createOrderDto.items,
        status: OrderStatus.PENDING,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: createOrderDto.shippingAddress,
        notes: createOrderDto.notes || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdOrder = await this.orderRepository.create(order);

      logger.info('Order created successfully', {
        orderId: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        customerId: createdOrder.customerId,
        total: createdOrder.total,
      });

      return createdOrder;
    } catch (error) {
      logger.error('Failed to create order', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId: createOrderDto.customerId,
      });
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  public async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw OperationalError.notFound('Order not found');
    }

    return order;
  }

  /**
   * Get orders with pagination and filtering
   */
  public async getOrders(query: OrderQueryDto): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { orders, total } = await this.orderRepository.findMany(query);

    const totalPages = Math.ceil(total / query.limit);

    return {
      orders,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  /**
   * Update order
   */
  public async updateOrder(orderId: string, updateDto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.getOrderById(orderId);

    // Validate status transitions
    if (updateDto.status && !this.isValidStatusTransition(existingOrder.status, updateDto.status)) {
      throw OperationalError.badRequest(
        `Invalid status transition from ${existingOrder.status} to ${updateDto.status}`
      );
    }

    const updateData: Partial<Order> = {
      updatedAt: new Date(),
    };

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }
    if (updateDto.notes !== undefined) {
      updateData.notes = updateDto.notes;
    }
    if (updateDto.shippingAddress !== undefined) {
      updateData.shippingAddress = updateDto.shippingAddress;
    }

    const updatedOrder = await this.orderRepository.update(orderId, updateData);

    logger.info('Order updated successfully', {
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
    });

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  public async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw OperationalError.badRequest('Order is already cancelled');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw OperationalError.badRequest('Cannot cancel delivered order');
    }

    const updatedOrder = await this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      notes: reason
        ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim()
        : order.notes || undefined,
      updatedAt: new Date(),
    });

    logger.info('Order cancelled successfully', {
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderNumber,
      reason,
    });

    return updatedOrder;
  }

  /**
   * Get order statistics
   */
  public async getOrderStats(customerId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: Record<OrderStatus, number>;
  }> {
    return this.orderRepository.getStats(customerId);
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // No transitions from delivered
      [OrderStatus.CANCELLED]: [], // No transitions from cancelled
    };

    return validTransitions[currentStatus].includes(newStatus);
  }
}
