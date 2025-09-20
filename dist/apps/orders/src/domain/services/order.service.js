"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_dto_1 = require("../dtos/order.dto");
const errors_1 = require("@shared/errors");
const logger_1 = require("@libraries/logger");
class OrderService {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async createOrder(createOrderDto) {
        try {
            const subtotal = createOrderDto.items.reduce((sum, item) => sum + item.total, 0);
            const tax = subtotal * 0.1;
            const shipping = subtotal > 100 ? 0 : 10;
            const total = subtotal + tax + shipping;
            const orderNumber = this.generateOrderNumber();
            const order = {
                orderNumber,
                customerId: createOrderDto.customerId,
                items: createOrderDto.items,
                status: order_dto_1.OrderStatus.PENDING,
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
            logger_1.logger.info('Order created successfully', {
                orderId: createdOrder._id,
                orderNumber: createdOrder.orderNumber,
                customerId: createdOrder.customerId,
                total: createdOrder.total,
            });
            return createdOrder;
        }
        catch (error) {
            logger_1.logger.error('Failed to create order', {
                error: error instanceof Error ? error.message : 'Unknown error',
                customerId: createOrderDto.customerId,
            });
            throw error;
        }
    }
    async getOrderById(orderId) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw errors_1.OperationalError.notFound('Order not found');
        }
        return order;
    }
    async getOrders(query) {
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
    async updateOrder(orderId, updateDto) {
        const existingOrder = await this.getOrderById(orderId);
        if (updateDto.status && !this.isValidStatusTransition(existingOrder.status, updateDto.status)) {
            throw errors_1.OperationalError.badRequest(`Invalid status transition from ${existingOrder.status} to ${updateDto.status}`);
        }
        const updateData = {
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
        logger_1.logger.info('Order updated successfully', {
            orderId: updatedOrder._id,
            orderNumber: updatedOrder.orderNumber,
            status: updatedOrder.status,
        });
        return updatedOrder;
    }
    async cancelOrder(orderId, reason) {
        const order = await this.getOrderById(orderId);
        if (order.status === order_dto_1.OrderStatus.CANCELLED) {
            throw errors_1.OperationalError.badRequest('Order is already cancelled');
        }
        if (order.status === order_dto_1.OrderStatus.DELIVERED) {
            throw errors_1.OperationalError.badRequest('Cannot cancel delivered order');
        }
        const updatedOrder = await this.orderRepository.update(orderId, {
            status: order_dto_1.OrderStatus.CANCELLED,
            notes: reason
                ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim()
                : order.notes || undefined,
            updatedAt: new Date(),
        });
        logger_1.logger.info('Order cancelled successfully', {
            orderId: updatedOrder._id,
            orderNumber: updatedOrder.orderNumber,
            reason,
        });
        return updatedOrder;
    }
    async getOrderStats(customerId) {
        return this.orderRepository.getStats(customerId);
    }
    generateOrderNumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `ORD-${timestamp}-${random}`.toUpperCase();
    }
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [order_dto_1.OrderStatus.PENDING]: [order_dto_1.OrderStatus.CONFIRMED, order_dto_1.OrderStatus.CANCELLED],
            [order_dto_1.OrderStatus.CONFIRMED]: [order_dto_1.OrderStatus.PROCESSING, order_dto_1.OrderStatus.CANCELLED],
            [order_dto_1.OrderStatus.PROCESSING]: [order_dto_1.OrderStatus.SHIPPED, order_dto_1.OrderStatus.CANCELLED],
            [order_dto_1.OrderStatus.SHIPPED]: [order_dto_1.OrderStatus.DELIVERED],
            [order_dto_1.OrderStatus.DELIVERED]: [],
            [order_dto_1.OrderStatus.CANCELLED]: [],
        };
        return validTransitions[currentStatus].includes(newStatus);
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map