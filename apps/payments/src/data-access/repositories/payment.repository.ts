/**
 * @fileoverview Payment repository - MongoDB data access layer
 * @author Node.js Best Practices
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@shared/db/mongo';
import {
  Payment,
  Refund,
  PaymentQueryDto,
  PaymentStatus,
  PaymentMethod,
} from '../../domain/dtos/payment.dto';
import { logger } from '@libraries/logger';

export class PaymentRepository {
  private get paymentCollection(): Collection<Payment> {
    return getDb().collection<Payment>('payments');
  }

  private get refundCollection(): Collection<Refund> {
    return getDb().collection<Refund>('refunds');
  }

  /**
   * Create a new payment
   */
  public async create(payment: Omit<Payment, '_id'>): Promise<Payment> {
    try {
      const result = await this.paymentCollection.insertOne(payment as Payment);

      if (!result.insertedId) {
        throw new Error('Failed to create payment');
      }

      const createdPayment = await this.paymentCollection.findOne({ _id: result.insertedId });

      if (!createdPayment) {
        throw new Error('Payment not found after creation');
      }

      return createdPayment;
    } catch (error) {
      logger.error('Failed to create payment in database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find payment by ID
   */
  public async findById(paymentId: string): Promise<Payment | null> {
    try {
      if (!ObjectId.isValid(paymentId)) {
        return null;
      }

      return await this.paymentCollection.findOne({ _id: paymentId as any });
    } catch (error) {
      logger.error('Failed to find payment by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Find payment by order ID
   */
  public async findByOrderId(orderId: string): Promise<Payment | null> {
    try {
      return await this.paymentCollection.findOne({ orderId });
    } catch (error) {
      logger.error('Failed to find payment by order ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
      });
      throw error;
    }
  }

  /**
   * Find payments with pagination and filtering
   */
  public async findMany(query: PaymentQueryDto): Promise<{
    payments: Payment[];
    total: number;
  }> {
    try {
      // Build filter
      const filter: any = {};

      if (query.status) {
        filter.status = query.status;
      }

      if (query.paymentMethod) {
        filter.paymentMethod = query.paymentMethod;
      }

      if (query.customerId) {
        filter.customerId = query.customerId;
      }

      if (query.orderId) {
        filter.orderId = query.orderId;
      }

      // Build sort
      const sort: any = {};
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

      // Calculate skip
      const skip = (query.page - 1) * query.limit;

      // Execute queries in parallel
      const [payments, total] = await Promise.all([
        this.paymentCollection.find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
        this.paymentCollection.countDocuments(filter),
      ]);

      return { payments, total };
    } catch (error) {
      logger.error('Failed to find payments', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
      });
      throw error;
    }
  }

  /**
   * Update payment
   */
  public async update(paymentId: string, updateData: Partial<Payment>): Promise<Payment> {
    try {
      if (!ObjectId.isValid(paymentId)) {
        throw new Error('Invalid payment ID');
      }

      const result = await this.paymentCollection.findOneAndUpdate(
        { _id: paymentId as any },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Payment not found');
      }

      return result;
    } catch (error) {
      logger.error('Failed to update payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Delete payment
   */
  public async delete(paymentId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(paymentId)) {
        return false;
      }

      const result = await this.paymentCollection.deleteOne({ _id: paymentId as any });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to delete payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Create refund
   */
  public async createRefund(refund: Omit<Refund, '_id'>): Promise<Refund> {
    try {
      const result = await this.refundCollection.insertOne(refund as Refund);

      if (!result.insertedId) {
        throw new Error('Failed to create refund');
      }

      const createdRefund = await this.refundCollection.findOne({ _id: result.insertedId });

      if (!createdRefund) {
        throw new Error('Refund not found after creation');
      }

      return createdRefund;
    } catch (error) {
      logger.error('Failed to create refund in database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  public async getStats(customerId?: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    statusCounts: Record<PaymentStatus, number>;
    methodCounts: Record<PaymentMethod, number>;
  }> {
    try {
      const matchFilter = customerId ? { customerId } : {};

      const pipeline = [
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            statusCounts: { $push: '$status' },
            methodCounts: { $push: '$paymentMethod' },
          },
        },
        {
          $project: {
            totalPayments: 1,
            totalAmount: 1,
            averageAmount: {
              $cond: {
                if: { $gt: ['$totalPayments', 0] },
                then: { $divide: ['$totalAmount', '$totalPayments'] },
                else: 0,
              },
            },
            statusCounts: 1,
            methodCounts: 1,
          },
        },
      ];

      const result = await this.paymentCollection.aggregate(pipeline).toArray();
      const stats = result[0] || {
        totalPayments: 0,
        totalAmount: 0,
        averageAmount: 0,
        statusCounts: [],
        methodCounts: [],
      };

      // Count status occurrences
      const statusCounts: Record<PaymentStatus, number> = {
        [PaymentStatus.PENDING]: 0,
        [PaymentStatus.PROCESSING]: 0,
        [PaymentStatus.COMPLETED]: 0,
        [PaymentStatus.FAILED]: 0,
        [PaymentStatus.CANCELLED]: 0,
        [PaymentStatus.REFUNDED]: 0,
      };

      stats.statusCounts.forEach((status: PaymentStatus) => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Count method occurrences
      const methodCounts: Record<PaymentMethod, number> = {
        [PaymentMethod.CREDIT_CARD]: 0,
        [PaymentMethod.DEBIT_CARD]: 0,
        [PaymentMethod.BANK_TRANSFER]: 0,
        [PaymentMethod.PAYPAL]: 0,
        [PaymentMethod.STRIPE]: 0,
      };

      stats.methodCounts.forEach((method: PaymentMethod) => {
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });

      return {
        totalPayments: stats.totalPayments,
        totalAmount: stats.totalAmount,
        averageAmount: stats.averageAmount,
        statusCounts,
        methodCounts,
      };
    } catch (error) {
      logger.error('Failed to get payment statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId,
      });
      throw error;
    }
  }
}
