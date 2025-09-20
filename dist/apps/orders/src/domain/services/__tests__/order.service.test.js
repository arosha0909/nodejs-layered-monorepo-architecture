"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_service_1 = require("../order.service");
const order_repository_1 = require("../../../data-access/repositories/order.repository");
const order_dto_1 = require("../../dtos/order.dto");
const errors_1 = require("@shared/errors");
jest.mock('../../../data-access/repositories/order.repository');
jest.mock('@libraries/logger');
describe('OrderService', () => {
    let orderService;
    let mockOrderRepository;
    beforeEach(() => {
        mockOrderRepository = new order_repository_1.OrderRepository();
        orderService = new order_service_1.OrderService(mockOrderRepository);
    });
    describe('createOrder', () => {
        it('should create an order successfully', async () => {
            const createOrderDto = {
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
                status: order_dto_1.OrderStatus.PENDING,
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
            const result = await orderService.createOrder(createOrderDto);
            expect(result).toEqual(expectedOrder);
            expect(mockOrderRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                customerId: 'customer-123',
                items: createOrderDto.items,
                status: order_dto_1.OrderStatus.PENDING,
                subtotal: 200,
                tax: 20,
                shipping: 0,
                total: 220,
            }));
        });
        it('should calculate free shipping for orders over $100', async () => {
            const createOrderDto = {
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
                status: order_dto_1.OrderStatus.PENDING,
                subtotal: 150,
                tax: 15,
                shipping: 0,
                total: 165,
                shippingAddress: createOrderDto.shippingAddress,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockOrderRepository.create.mockResolvedValue(expectedOrder);
            const result = await orderService.createOrder(createOrderDto);
            expect(result.shipping).toBe(0);
            expect(result.total).toBe(165);
        });
    });
    describe('getOrderById', () => {
        it('should return order when found', async () => {
            const orderId = 'order-123';
            const expectedOrder = {
                _id: orderId,
                orderNumber: 'ORD-1234567890-ABC123',
                customerId: 'customer-123',
                items: [],
                status: order_dto_1.OrderStatus.PENDING,
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
            const result = await orderService.getOrderById(orderId);
            expect(result).toEqual(expectedOrder);
            expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
        });
        it('should throw OperationalError when order not found', async () => {
            const orderId = 'non-existent-order';
            mockOrderRepository.findById.mockResolvedValue(null);
            await expect(orderService.getOrderById(orderId)).rejects.toThrow(errors_1.OperationalError);
            await expect(orderService.getOrderById(orderId)).rejects.toThrow('Order not found');
        });
    });
    describe('cancelOrder', () => {
        it('should cancel order successfully', async () => {
            const orderId = 'order-123';
            const existingOrder = {
                _id: orderId,
                orderNumber: 'ORD-1234567890-ABC123',
                customerId: 'customer-123',
                items: [],
                status: order_dto_1.OrderStatus.PENDING,
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
                status: order_dto_1.OrderStatus.CANCELLED,
                updatedAt: new Date(),
            };
            mockOrderRepository.findById.mockResolvedValue(existingOrder);
            mockOrderRepository.update.mockResolvedValue(updatedOrder);
            const result = await orderService.cancelOrder(orderId, 'Customer requested');
            expect(result.status).toBe(order_dto_1.OrderStatus.CANCELLED);
            expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
                status: order_dto_1.OrderStatus.CANCELLED,
                notes: 'Cancellation reason: Customer requested',
                updatedAt: expect.any(Date),
            });
        });
        it('should throw error when trying to cancel already cancelled order', async () => {
            const orderId = 'order-123';
            const existingOrder = {
                _id: orderId,
                orderNumber: 'ORD-1234567890-ABC123',
                customerId: 'customer-123',
                items: [],
                status: order_dto_1.OrderStatus.CANCELLED,
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
            await expect(orderService.cancelOrder(orderId)).rejects.toThrow(errors_1.OperationalError);
            await expect(orderService.cancelOrder(orderId)).rejects.toThrow('Order is already cancelled');
        });
        it('should throw error when trying to cancel delivered order', async () => {
            const orderId = 'order-123';
            const existingOrder = {
                _id: orderId,
                orderNumber: 'ORD-1234567890-ABC123',
                customerId: 'customer-123',
                items: [],
                status: order_dto_1.OrderStatus.DELIVERED,
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
            await expect(orderService.cancelOrder(orderId)).rejects.toThrow(errors_1.OperationalError);
            await expect(orderService.cancelOrder(orderId)).rejects.toThrow('Cannot cancel delivered order');
        });
    });
});
//# sourceMappingURL=order.service.test.js.map