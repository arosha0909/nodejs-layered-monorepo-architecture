/**
 * @fileoverview Order repository - MongoDB data access layer
 * @author Node.js Best Practices
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@shared/db/mongo';
import { Order, OrderQueryDto, OrderStatus } from '../../domain/dtos/order.dto';
import { logger } from '@libraries/logger';

export class OrderRepository {
  private get collection(): Collection<Order> {
    return getDb().collection<Order>('orders');
  }

  /**
   * Create a new order
   */
  public async create(order: Omit<Order, '_id'>): Promise<Order> {
    try {
      const result = await this.collection.insertOne(order as Order);

      if (!result.insertedId) {
        throw new Error('Failed to create order');
      }

      const createdOrder = await this.collection.findOne({ _id: result.insertedId });

      if (!createdOrder) {
        throw new Error('Order not found after creation');
      }

      return createdOrder;
    } catch (error) {
      logger.error('Failed to create order in database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find order by ID
   */
  public async findById(orderId: string): Promise<Order | null> {
    try {
      if (!ObjectId.isValid(orderId)) {
        return null;
      }

      return await this.collection.findOne({ _id: orderId as any });
    } catch (error) {
      logger.error('Failed to find order by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
      });
      throw error;
    }
  }

  /**
   * Find order by order number
   */
  public async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      return await this.collection.findOne({ orderNumber });
    } catch (error) {
      logger.error('Failed to find order by order number', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderNumber,
      });
      throw error;
    }
  }

  /**
   * Find orders with pagination and filtering
   */
  public async findMany(query: OrderQueryDto): Promise<{
    orders: Order[];
    total: number;
  }> {
    try {
      // Build filter
      const filter: any = {};

      if (query.status) {
        filter.status = query.status;
      }

      if (query.customerId) {
        filter.customerId = query.customerId;
      }

      // Build sort
      const sort: any = {};
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

      // Calculate skip
      const skip = (query.page - 1) * query.limit;

      // Execute queries in parallel
      const [orders, total] = await Promise.all([
        this.collection.find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
        this.collection.countDocuments(filter),
      ]);

      return { orders, total };
    } catch (error) {
      logger.error('Failed to find orders', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
      });
      throw error;
    }
  }

  /**
   * Update order
   */
  public async update(orderId: string, updateData: Partial<Order>): Promise<Order> {
    try {
      if (!ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID');
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: orderId as any },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Order not found');
      }

      return result;
    } catch (error) {
      logger.error('Failed to update order', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
      });
      throw error;
    }
  }

  /**
   * Delete order
   */
  public async delete(orderId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(orderId)) {
        return false;
      }

      const result = await this.collection.deleteOne({ _id: orderId as any });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to delete order', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
      });
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  public async getStats(customerId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: Record<OrderStatus, number>;
  }> {
    try {
      const matchFilter = customerId ? { customerId } : {};

      const pipeline = [
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            statusCounts: {
              $push: '$status',
            },
          },
        },
        {
          $project: {
            totalOrders: 1,
            totalRevenue: 1,
            averageOrderValue: {
              $cond: {
                if: { $gt: ['$totalOrders', 0] },
                then: { $divide: ['$totalRevenue', '$totalOrders'] },
                else: 0,
              },
            },
            statusCounts: 1,
          },
        },
      ];

      const result = await this.collection.aggregate(pipeline).toArray();
      const stats = result[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusCounts: [],
      };

      // Count status occurrences
      const statusCounts: Record<OrderStatus, number> = {
        [OrderStatus.PENDING]: 0,
        [OrderStatus.CONFIRMED]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.SHIPPED]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0,
      };

      stats.statusCounts.forEach((status: OrderStatus) => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return {
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        averageOrderValue: stats.averageOrderValue,
        statusCounts,
      };
    } catch (error) {
      logger.error('Failed to get order statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId,
      });
      throw error;
    }
  }
}
