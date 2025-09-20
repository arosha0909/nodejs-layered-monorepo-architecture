/**
 * @fileoverview Payment API controller - Express layer
 * @author Node.js Best Practices
 */

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../../../domain/services/payment.service';
import { PaymentRepository } from '../../../data-access/repositories/payment.repository';
import {
  CreatePaymentSchema,
  UpdatePaymentSchema,
  PaymentQuerySchema,
  RefundSchema,
} from '../../../domain/dtos/payment.dto';
import { OperationalError } from '@shared/errors';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService(new PaymentRepository());
  }

  /**
   * Create a new payment
   */
  public createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreatePaymentSchema.parse(req.body);

      // Add customer ID from authenticated user
      const createPaymentDto = {
        ...validatedData,
        customerId: req.user?.userId || validatedData.customerId,
      };

      const payment = await this.paymentService.createPayment(createPaymentDto);

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment created successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Process payment
   */
  public processPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw OperationalError.badRequest('Payment ID is required');
      }
      const payment = await this.paymentService.processPayment(paymentId);

      res.json({
        success: true,
        data: payment,
        message: 'Payment processed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment by ID
   */
  public getPaymentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw OperationalError.badRequest('Payment ID is required');
      }
      const payment = await this.paymentService.getPaymentById(paymentId);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payments with pagination and filtering
   */
  public getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = PaymentQuerySchema.parse(req.query);

      // Add customer filter if user is not admin
      if (req.user?.role !== 'admin') {
        validatedQuery.customerId = req.user?.userId;
      }

      const result = await this.paymentService.getPayments(validatedQuery);

      res.json({
        success: true,
        data: result.payments,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid query parameters'));
        return;
      }
      next(error);
    }
  };

  /**
   * Update payment
   */
  public updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw OperationalError.badRequest('Payment ID is required');
      }
      const validatedData = UpdatePaymentSchema.parse(req.body);

      const payment = await this.paymentService.updatePayment(paymentId, validatedData);

      res.json({
        success: true,
        data: payment,
        message: 'Payment updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Cancel payment
   */
  public cancelPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw OperationalError.badRequest('Payment ID is required');
      }
      const { reason } = req.body;

      const payment = await this.paymentService.cancelPayment(paymentId, reason);

      res.json({
        success: true,
        data: payment,
        message: 'Payment cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process refund
   */
  public processRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw OperationalError.badRequest('Payment ID is required');
      }
      const validatedData = RefundSchema.parse(req.body);

      const refund = await this.paymentService.processRefund(paymentId, validatedData);

      res.json({
        success: true,
        data: refund,
        message: 'Refund processed successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Get payment statistics
   */
  public getPaymentStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Only allow admin to see all stats, others see only their own
      const customerId =
        req.user?.role === 'admin' ? (req.query.customerId as string) : req.user?.userId;

      const stats = await this.paymentService.getPaymentStats(customerId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
