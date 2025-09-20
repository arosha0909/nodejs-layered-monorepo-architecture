"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../../../domain/services/payment.service");
const payment_repository_1 = require("../../../data-access/repositories/payment.repository");
const payment_dto_1 = require("../../../domain/dtos/payment.dto");
const errors_1 = require("@shared/errors");
class PaymentController {
    paymentService;
    constructor() {
        this.paymentService = new payment_service_1.PaymentService(new payment_repository_1.PaymentRepository());
    }
    createPayment = async (req, res, next) => {
        try {
            const validatedData = payment_dto_1.CreatePaymentSchema.parse(req.body);
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
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                next(errors_1.OperationalError.badRequest('Invalid request data'));
                return;
            }
            next(error);
        }
    };
    processPayment = async (req, res, next) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                throw errors_1.OperationalError.badRequest('Payment ID is required');
            }
            const payment = await this.paymentService.processPayment(paymentId);
            res.json({
                success: true,
                data: payment,
                message: 'Payment processed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    getPaymentById = async (req, res, next) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                throw errors_1.OperationalError.badRequest('Payment ID is required');
            }
            const payment = await this.paymentService.getPaymentById(paymentId);
            res.json({
                success: true,
                data: payment,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getPayments = async (req, res, next) => {
        try {
            const validatedQuery = payment_dto_1.PaymentQuerySchema.parse(req.query);
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
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                next(errors_1.OperationalError.badRequest('Invalid query parameters'));
                return;
            }
            next(error);
        }
    };
    updatePayment = async (req, res, next) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                throw errors_1.OperationalError.badRequest('Payment ID is required');
            }
            const validatedData = payment_dto_1.UpdatePaymentSchema.parse(req.body);
            const payment = await this.paymentService.updatePayment(paymentId, validatedData);
            res.json({
                success: true,
                data: payment,
                message: 'Payment updated successfully',
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
    cancelPayment = async (req, res, next) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                throw errors_1.OperationalError.badRequest('Payment ID is required');
            }
            const { reason } = req.body;
            const payment = await this.paymentService.cancelPayment(paymentId, reason);
            res.json({
                success: true,
                data: payment,
                message: 'Payment cancelled successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    processRefund = async (req, res, next) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                throw errors_1.OperationalError.badRequest('Payment ID is required');
            }
            const validatedData = payment_dto_1.RefundSchema.parse(req.body);
            const refund = await this.paymentService.processRefund(paymentId, validatedData);
            res.json({
                success: true,
                data: refund,
                message: 'Refund processed successfully',
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
    getPaymentStats = async (req, res, next) => {
        try {
            const customerId = req.user?.role === 'admin' ? req.query.customerId : req.user?.userId;
            const stats = await this.paymentService.getPaymentStats(customerId);
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
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map