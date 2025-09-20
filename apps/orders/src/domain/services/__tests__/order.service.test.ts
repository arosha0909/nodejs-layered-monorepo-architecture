/**
 * @fileoverview Order service tests
 * @author Node.js Best Practices
 */

import { OrderService } from '../order.service';
import { OrderRepository } from '../../../data-access/repositories/order.repository';
import { CreateOrderDto, OrderStatus } from '../../dtos/order.dto';
import { OperationalError } from '@shared/errors';

// Mock the repository
jest.mock('../../../data-access/repositories/order.repository');
jest.mock('@libraries/logger');

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    mockOrderRepository = new OrderRepository() as jest.Mocked<OrderRepository>;
    orderService = new OrderService(mockOrderRepository);
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        customerId: 'customer-123',
        items: [
          {
            productId: 'product-1',
            name: 'Test Product',
            price: 100,
            quantity: 2,
            total: 200,
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        notes: 'Test order',
      };

      const expectedOrder = {
        _id: 'order-123',
        orderNumber: 'ORD-1234567890-ABC123',
        customerId: 'customer-123',
        items: createOrderDto.items,
        status: OrderStatus.PENDING,
        subtotal: 200,
        tax: 20,
        shipping: 10,
        total: 230,
        shippingAddress: createOrderDto.shippingAddress,
        notes: 'Test order',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.create.mockResolvedValue(expectedOrder);

      // Act
      const result = await orderService.createOrder(createOrderDto);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer-123',
          items: createOrderDto.items,
          status: OrderStatus.PENDING,
          subtotal: 200,
          tax: 20,
          shipping: 0, // Free shipping over $100
          total: 220, // 200 + 20 + 0
        })
      );
    });

    it('should calculate free shipping for orders over $100', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        customerId: 'customer-123',
        items: [
          {
            productId: 'product-1',
            name: 'Expensive Product',
            price: 150,
            quantity: 1,
            total: 150,
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
      };

      const expectedOrder = {
        _id: 'order-123',
        orderNumber: 'ORD-1234567890-ABC123',
        customerId: 'customer-123',
        items: createOrderDto.items,
        status: OrderStatus.PENDING,
        subtotal: 150,
        tax: 15,
        shipping: 0, // Free shipping over $100
        total: 165,
        shippingAddress: createOrderDto.shippingAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.create.mockResolvedValue(expectedOrder);

      // Act
      const result = await orderService.createOrder(createOrderDto);

      // Assert
      expect(result.shipping).toBe(0);
      expect(result.total).toBe(165);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      // Arrange
      const orderId = 'order-123';
      const expectedOrder = {
        _id: orderId,
        orderNumber: 'ORD-1234567890-ABC123',
        customerId: 'customer-123',
        items: [],
        status: OrderStatus.PENDING,
        subtotal: 100,
        tax: 10,
        shipping: 10,
        total: 120,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findById.mockResolvedValue(expectedOrder);

      // Act
      const result = await orderService.getOrderById(orderId);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });

    it('should throw OperationalError when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-order';
      mockOrderRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.getOrderById(orderId)).rejects.toThrow(OperationalError);
      await expect(orderService.getOrderById(orderId)).rejects.toThrow('Order not found');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      // Arrange
      const orderId = 'order-123';
      const existingOrder = {
        _id: orderId,
        orderNumber: 'ORD-1234567890-ABC123',
        customerId: 'customer-123',
        items: [],
        status: OrderStatus.PENDING,
        subtotal: 100,
        tax: 10,
        shipping: 10,
        total: 120,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedOrder = {
        ...existingOrder,
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
      };

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await orderService.cancelOrder(orderId, 'Customer requested');

      // Assert
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
        status: OrderStatus.CANCELLED,
        notes: 'Cancellation reason: Customer requested',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when trying to cancel already cancelled order', async () => {
      // Arrange
      const orderId = 'order-123';
      const existingOrder = {
        _id: orderId,
        orderNumber: 'ORD-1234567890-ABC123',
        customerId: 'customer-123',
        items: [],
        status: OrderStatus.CANCELLED,
        subtotal: 100,
        tax: 10,
        shipping: 10,
        total: 120,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findById.mockResolvedValue(existingOrder);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow(OperationalError);
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow('Order is already cancelled');
    });

    it('should throw error when trying to cancel delivered order', async () => {
      // Arrange
      const orderId = 'order-123';
      const existingOrder = {
        _id: orderId,
        orderNumber: 'ORD-1234567890-ABC123',
        customerId: 'customer-123',
        items: [],
        status: OrderStatus.DELIVERED,
        subtotal: 100,
        tax: 10,
        shipping: 10,
        total: 120,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findById.mockResolvedValue(existingOrder);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow(OperationalError);
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow(
        'Cannot cancel delivered order'
      );
    });
  });
});
