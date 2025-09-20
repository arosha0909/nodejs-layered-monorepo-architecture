/**
 * @fileoverview Order API controller - Express layer
 * @author Node.js Best Practices
 */

import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../../../domain/services/order.service';
import { OrderRepository } from '../../../data-access/repositories/order.repository';
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  OrderQuerySchema,
} from '../../../domain/dtos/order.dto';
import { OperationalError } from '@shared/errors';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService(new OrderRepository());
  }

  /**
   * Create a new order
   */
  public createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const validatedData = CreateOrderSchema.parse(req.body);

      // Add customer ID from authenticated user
      const createOrderDto = {
        ...validatedData,
        customerId: req.user?.userId || validatedData.customerId,
      };

      const order = await this.orderService.createOrder(createOrderDto);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
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
   * Get order by ID
   */
  public getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        throw OperationalError.badRequest('Order ID is required');
      }
      const order = await this.orderService.getOrderById(orderId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get orders with pagination and filtering
   */
  public getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate query parameters
      const validatedQuery = OrderQuerySchema.parse(req.query);

      // Add customer filter if user is not admin
      if (req.user?.role !== 'admin') {
        validatedQuery.customerId = req.user?.userId;
      }

      const result = await this.orderService.getOrders(validatedQuery);

      res.json({
        success: true,
        data: result.orders,
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
   * Update order
   */
  public updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        throw OperationalError.badRequest('Order ID is required');
      }
      const validatedData = UpdateOrderSchema.parse(req.body);

      const order = await this.orderService.updateOrder(orderId, validatedData);

      res.json({
        success: true,
        data: order,
        message: 'Order updated successfully',
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
   * Cancel order
   */
  public cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        throw OperationalError.badRequest('Order ID is required');
      }
      const { reason } = req.body;

      const order = await this.orderService.cancelOrder(orderId, reason);

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order statistics
   */
  public getOrderStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only allow admin to see all stats, others see only their own
      const customerId =
        req.user?.role === 'admin' ? (req.query.customerId as string) : req.user?.userId;

      const stats = await this.orderService.getOrderStats(customerId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
