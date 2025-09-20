"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const payment_dto_1 = require("../dtos/payment.dto");
const errors_1 = require("@shared/errors");
const logger_1 = require("@libraries/logger");
class PaymentService {
    paymentRepository;
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async createPayment(createPaymentDto) {
        try {
            const existingPayment = await this.paymentRepository.findByOrderId(createPaymentDto.orderId);
            if (existingPayment && existingPayment.status !== payment_dto_1.PaymentStatus.FAILED) {
                throw errors_1.OperationalError.conflict('Payment already exists for this order');
            }
            const payment = {
                orderId: createPaymentDto.orderId,
                amount: createPaymentDto.amount,
                currency: createPaymentDto.currency,
                paymentMethod: createPaymentDto.paymentMethod,
                status: payment_dto_1.PaymentStatus.PENDING,
                customerId: createPaymentDto.customerId,
                description: createPaymentDto.description || undefined,
                metadata: createPaymentDto.metadata || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const createdPayment = await this.paymentRepository.create(payment);
            logger_1.logger.info('Payment created successfully', {
                paymentId: createdPayment._id,
                orderId: createdPayment.orderId,
                amount: createdPayment.amount,
                customerId: createdPayment.customerId,
            });
            return this.toPaymentResponse(createdPayment);
        }
        catch (error) {
            logger_1.logger.error('Failed to create payment', {
                error: error instanceof Error ? error.message : 'Unknown error',
                orderId: createPaymentDto.orderId,
                customerId: createPaymentDto.customerId,
            });
            throw error;
        }
    }
    async processPayment(paymentId) {
        try {
            const payment = await this.paymentRepository.findById(paymentId);
            if (!payment) {
                throw errors_1.OperationalError.notFound('Payment not found');
            }
            if (payment.status !== payment_dto_1.PaymentStatus.PENDING) {
                throw errors_1.OperationalError.badRequest(`Payment is already ${payment.status}`);
            }
            const isSuccessful = await this.simulatePaymentProcessing(payment);
            const updateData = {
                status: isSuccessful ? payment_dto_1.PaymentStatus.COMPLETED : payment_dto_1.PaymentStatus.FAILED,
                transactionId: isSuccessful ? this.generateTransactionId() : undefined,
                failureReason: isSuccessful ? undefined : 'Payment processing failed',
                processedAt: new Date(),
                updatedAt: new Date(),
            };
            const updatedPayment = await this.paymentRepository.update(paymentId, updateData);
            logger_1.logger.info('Payment processed', {
                paymentId: updatedPayment._id,
                orderId: updatedPayment.orderId,
                status: updatedPayment.status,
                transactionId: updatedPayment.transactionId,
            });
            return this.toPaymentResponse(updatedPayment);
        }
        catch (error) {
            logger_1.logger.error('Failed to process payment', {
                error: error instanceof Error ? error.message : 'Unknown error',
                paymentId,
            });
            throw error;
        }
    }
    async getPaymentById(paymentId) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw errors_1.OperationalError.notFound('Payment not found');
        }
        return this.toPaymentResponse(payment);
    }
    async getPayments(query) {
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
    async updatePayment(paymentId, updateDto) {
        const existingPayment = await this.paymentRepository.findById(paymentId);
        if (!existingPayment) {
            throw errors_1.OperationalError.notFound('Payment not found');
        }
        const updateData = {
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
        logger_1.logger.info('Payment updated successfully', {
            paymentId: updatedPayment._id,
            orderId: updatedPayment.orderId,
            status: updatedPayment.status,
        });
        return this.toPaymentResponse(updatedPayment);
    }
    async cancelPayment(paymentId, reason) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw errors_1.OperationalError.notFound('Payment not found');
        }
        if (payment.status === payment_dto_1.PaymentStatus.COMPLETED) {
            throw errors_1.OperationalError.badRequest('Cannot cancel completed payment');
        }
        if (payment.status === payment_dto_1.PaymentStatus.CANCELLED) {
            throw errors_1.OperationalError.badRequest('Payment is already cancelled');
        }
        const updatedPayment = await this.paymentRepository.update(paymentId, {
            status: payment_dto_1.PaymentStatus.CANCELLED,
            failureReason: reason || undefined,
            updatedAt: new Date(),
        });
        logger_1.logger.info('Payment cancelled successfully', {
            paymentId: updatedPayment._id,
            orderId: updatedPayment.orderId,
            reason,
        });
        return this.toPaymentResponse(updatedPayment);
    }
    async processRefund(paymentId, refundDto) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw errors_1.OperationalError.notFound('Payment not found');
        }
        if (payment.status !== payment_dto_1.PaymentStatus.COMPLETED) {
            throw errors_1.OperationalError.badRequest('Can only refund completed payments');
        }
        const refundAmount = refundDto.amount || payment.amount;
        if (refundAmount > payment.amount) {
            throw errors_1.OperationalError.badRequest('Refund amount cannot exceed payment amount');
        }
        const isSuccessful = await this.simulateRefundProcessing(payment, refundAmount);
        const refund = {
            paymentId: paymentId,
            amount: refundAmount,
            reason: refundDto.reason,
            status: isSuccessful ? payment_dto_1.PaymentStatus.COMPLETED : payment_dto_1.PaymentStatus.FAILED,
            transactionId: isSuccessful ? this.generateTransactionId() : undefined,
            metadata: refundDto.metadata || undefined,
            processedAt: isSuccessful ? new Date() : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const createdRefund = await this.paymentRepository.createRefund(refund);
        if (isSuccessful) {
            await this.paymentRepository.update(paymentId, {
                status: payment_dto_1.PaymentStatus.REFUNDED,
                updatedAt: new Date(),
            });
        }
        logger_1.logger.info('Refund processed', {
            refundId: createdRefund._id,
            paymentId: paymentId,
            amount: refundAmount,
            status: createdRefund.status,
        });
        return createdRefund;
    }
    async getPaymentStats(customerId) {
        return this.paymentRepository.getStats(customerId);
    }
    async simulatePaymentProcessing(_payment) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.05;
    }
    async simulateRefundProcessing(_payment, _amount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.02;
    }
    generateTransactionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `TXN-${timestamp}-${random}`.toUpperCase();
    }
    toPaymentResponse(payment) {
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
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map