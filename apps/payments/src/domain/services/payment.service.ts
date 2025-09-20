/**
 * @fileoverview Payment domain service - core business logic
 * @author Node.js Best Practices
 */

import {
  Payment,
  PaymentResponse,
  PaymentStatus,
  PaymentMethod,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryDto,
  RefundDto,
  Refund,
} from '../dtos/payment.dto';
import { PaymentRepository } from '../../data-access/repositories/payment.repository';
import { OperationalError } from '@shared/errors';
import { logger } from '@libraries/logger';

export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Create a new payment
   */
  public async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponse> {
    try {
      // Check if payment already exists for this order
      const existingPayment = await this.paymentRepository.findByOrderId(createPaymentDto.orderId);
      if (existingPayment && existingPayment.status !== PaymentStatus.FAILED) {
        throw OperationalError.conflict('Payment already exists for this order');
      }

      const payment: Omit<Payment, '_id'> = {
        orderId: createPaymentDto.orderId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        paymentMethod: createPaymentDto.paymentMethod,
        status: PaymentStatus.PENDING,
        customerId: createPaymentDto.customerId,
        description: createPaymentDto.description || undefined,
        metadata: createPaymentDto.metadata || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdPayment = await this.paymentRepository.create(payment);

      logger.info('Payment created successfully', {
        paymentId: createdPayment._id,
        orderId: createdPayment.orderId,
        amount: createdPayment.amount,
        customerId: createdPayment.customerId,
      });

      return this.toPaymentResponse(createdPayment);
    } catch (error) {
      logger.error('Failed to create payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: createPaymentDto.orderId,
        customerId: createPaymentDto.customerId,
      });
      throw error;
    }
  }

  /**
   * Process payment
   */
  public async processPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        throw OperationalError.notFound('Payment not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw OperationalError.badRequest(`Payment is already ${payment.status}`);
      }

      // Simulate payment processing
      const isSuccessful = await this.simulatePaymentProcessing(payment);

      const updateData: Partial<Payment> = {
        status: isSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        transactionId: isSuccessful ? this.generateTransactionId() : undefined,
        failureReason: isSuccessful ? undefined : 'Payment processing failed',
        processedAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPayment = await this.paymentRepository.update(paymentId, updateData);

      logger.info('Payment processed', {
        paymentId: updatedPayment._id,
        orderId: updatedPayment.orderId,
        status: updatedPayment.status,
        transactionId: updatedPayment.transactionId,
      });

      return this.toPaymentResponse(updatedPayment);
    } catch (error) {
      logger.error('Failed to process payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  public async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw OperationalError.notFound('Payment not found');
    }

    return this.toPaymentResponse(payment);
  }

  /**
   * Get payments with pagination and filtering
   */
  public async getPayments(query: PaymentQueryDto): Promise<{
    payments: PaymentResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { payments, total } = await this.paymentRepository.findMany(query);

    const totalPages = Math.ceil(total / query.limit);

    return {
      payments: payments.map(payment => this.toPaymentResponse(payment)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  /**
   * Update payment
   */
  public async updatePayment(
    paymentId: string,
    updateDto: UpdatePaymentDto
  ): Promise<PaymentResponse> {
    const existingPayment = await this.paymentRepository.findById(paymentId);

    if (!existingPayment) {
      throw OperationalError.notFound('Payment not found');
    }

    const updateData: Partial<Payment> = {
      updatedAt: new Date(),
    };

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }
    if (updateDto.transactionId !== undefined) {
      updateData.transactionId = updateDto.transactionId;
    }
    if (updateDto.failureReason !== undefined) {
      updateData.failureReason = updateDto.failureReason;
    }
    if (updateDto.metadata !== undefined) {
      updateData.metadata = updateDto.metadata;
    }

    const updatedPayment = await this.paymentRepository.update(paymentId, updateData);

    logger.info('Payment updated successfully', {
      paymentId: updatedPayment._id,
      orderId: updatedPayment.orderId,
      status: updatedPayment.status,
    });

    return this.toPaymentResponse(updatedPayment);
  }

  /**
   * Cancel payment
   */
  public async cancelPayment(paymentId: string, reason?: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw OperationalError.notFound('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw OperationalError.badRequest('Cannot cancel completed payment');
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw OperationalError.badRequest('Payment is already cancelled');
    }

    const updatedPayment = await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.CANCELLED,
      failureReason: reason || undefined,
      updatedAt: new Date(),
    });

    logger.info('Payment cancelled successfully', {
      paymentId: updatedPayment._id,
      orderId: updatedPayment.orderId,
      reason,
    });

    return this.toPaymentResponse(updatedPayment);
  }

  /**
   * Process refund
   */
  public async processRefund(paymentId: string, refundDto: RefundDto): Promise<Refund> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw OperationalError.notFound('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw OperationalError.badRequest('Can only refund completed payments');
    }

    const refundAmount = refundDto.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw OperationalError.badRequest('Refund amount cannot exceed payment amount');
    }

    // Simulate refund processing
    const isSuccessful = await this.simulateRefundProcessing(payment, refundAmount);

    const refund: Omit<Refund, '_id'> = {
      paymentId: paymentId,
      amount: refundAmount,
      reason: refundDto.reason,
      status: isSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      transactionId: isSuccessful ? this.generateTransactionId() : undefined,
      metadata: refundDto.metadata || undefined,
      processedAt: isSuccessful ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdRefund = await this.paymentRepository.createRefund(refund);

    // Update payment status if refund is successful
    if (isSuccessful) {
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.REFUNDED,
        updatedAt: new Date(),
      });
    }

    logger.info('Refund processed', {
      refundId: createdRefund._id,
      paymentId: paymentId,
      amount: refundAmount,
      status: createdRefund.status,
    });

    return createdRefund;
  }

  /**
   * Get payment statistics
   */
  public async getPaymentStats(customerId?: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    statusCounts: Record<PaymentStatus, number>;
    methodCounts: Record<PaymentMethod, number>;
  }> {
    return this.paymentRepository.getStats(customerId);
  }

  /**
   * Simulate payment processing
   */
  private async simulatePaymentProcessing(_payment: Payment): Promise<boolean> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  /**
   * Simulate refund processing
   */
  private async simulateRefundProcessing(_payment: Payment, _amount: number): Promise<boolean> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 98% success rate for refunds
    return Math.random() > 0.02;
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Convert Payment to PaymentResponse
   */
  private toPaymentResponse(payment: Payment): PaymentResponse {
    return {
      _id: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      customerId: payment.customerId,
      description: payment.description,
      transactionId: payment.transactionId,
      failureReason: payment.failureReason,
      metadata: payment.metadata,
      processedAt: payment.processedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
