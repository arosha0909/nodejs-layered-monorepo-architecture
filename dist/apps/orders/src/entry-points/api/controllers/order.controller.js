"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../../../domain/services/order.service");
const order_repository_1 = require("../../../data-access/repositories/order.repository");
const order_dto_1 = require("../../../domain/dtos/order.dto");
const errors_1 = require("@shared/errors");
class OrderController {
    orderService;
    constructor() {
        this.orderService = new order_service_1.OrderService(new order_repository_1.OrderRepository());
    }
    createOrder = async (req, res, next) => {
        try {
            const validatedData = order_dto_1.CreateOrderSchema.parse(req.body);
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
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                next(errors_1.OperationalError.badRequest('Invalid request data'));
                return;
            }
            next(error);
        }
    };
    getOrderById = async (req, res, next) => {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                throw errors_1.OperationalError.badRequest('Order ID is required');
            }
            const order = await this.orderService.getOrderById(orderId);
            res.json({
                success: true,
                data: order,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getOrders = async (req, res, next) => {
        try {
            const validatedQuery = order_dto_1.OrderQuerySchema.parse(req.query);
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
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                next(errors_1.OperationalError.badRequest('Invalid query parameters'));
                return;
            }
            next(error);
        }
    };
    updateOrder = async (req, res, next) => {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                throw errors_1.OperationalError.badRequest('Order ID is required');
            }
            const validatedData = order_dto_1.UpdateOrderSchema.parse(req.body);
            const order = await this.orderService.updateOrder(orderId, validatedData);
            res.json({
                success: true,
                data: order,
                message: 'Order updated successfully',
            });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                next(errors_1.OperationalError.badRequest('Invalid request data'));
                return;
            }
            next(error);
        }
    };
    cancelOrder = async (req, res, next) => {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                throw errors_1.OperationalError.badRequest('Order ID is required');
            }
            const { reason } = req.body;
            const order = await this.orderService.cancelOrder(orderId, reason);
            res.json({
                success: true,
                data: order,
                message: 'Order cancelled successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    getOrderStats = async (req, res, next) => {
        try {
            const customerId = req.user?.role === 'admin' ? req.query.customerId : req.user?.userId;
            const stats = await this.orderService.getOrderStats(customerId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map