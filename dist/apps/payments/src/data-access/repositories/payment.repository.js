"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_1 = require("@shared/db/mongo");
const payment_dto_1 = require("../../domain/dtos/payment.dto");
const logger_1 = require("@libraries/logger");
class PaymentRepository {
    paymentCollection;
    refundCollection;
    constructor() {
        this.paymentCollection = (0, mongo_1.getDb)().collection('payments');
        this.refundCollection = (0, mongo_1.getDb)().collection('refunds');
    }
    async create(payment) {
        try {
            const result = await this.paymentCollection.insertOne(payment);
            if (!result.insertedId) {
                throw new Error('Failed to create payment');
            }
            const createdPayment = await this.paymentCollection.findOne({ _id: result.insertedId });
            if (!createdPayment) {
                throw new Error('Payment not found after creation');
            }
            return createdPayment;
        }
        catch (error) {
            logger_1.logger.error('Failed to create payment in database', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async findById(paymentId) {
        try {
            if (!mongodb_1.ObjectId.isValid(paymentId)) {
                return null;
            }
            return await this.paymentCollection.findOne({ _id: paymentId });
        }
        catch (error) {
            logger_1.logger.error('Failed to find payment by ID', {
                error: error instanceof Error ? error.message : 'Unknown error',
                paymentId,
            });
            throw error;
        }
    }
    async findByOrderId(orderId) {
        try {
            return await this.paymentCollection.findOne({ orderId });
        }
        catch (error) {
            logger_1.logger.error('Failed to find payment by order ID', {
                error: error instanceof Error ? error.message : 'Unknown error',
                orderId,
            });
            throw error;
        }
    }
    async findMany(query) {
        try {
            const filter = {};
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
            const sort = {};
            sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
            const skip = (query.page - 1) * query.limit;
            const [payments, total] = await Promise.all([
                this.paymentCollection.find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
                this.paymentCollection.countDocuments(filter),
            ]);
            return { payments, total };
        }
        catch (error) {
            logger_1.logger.error('Failed to find payments', {
                error: error instanceof Error ? error.message : 'Unknown error',
                query,
            });
            throw error;
        }
    }
    async update(paymentId, updateData) {
        try {
            if (!mongodb_1.ObjectId.isValid(paymentId)) {
                throw new Error('Invalid payment ID');
            }
            const result = await this.paymentCollection.findOneAndUpdate({ _id: paymentId }, { $set: updateData }, { returnDocument: 'after' });
            if (!result) {
                throw new Error('Payment not found');
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to update payment', {
                error: error instanceof Error ? error.message : 'Unknown error',
                paymentId,
            });
            throw error;
        }
    }
    async delete(paymentId) {
        try {
            if (!mongodb_1.ObjectId.isValid(paymentId)) {
                return false;
            }
            const result = await this.paymentCollection.deleteOne({ _id: paymentId });
            return result.deletedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete payment', {
                error: error instanceof Error ? error.message : 'Unknown error',
                paymentId,
            });
            throw error;
        }
    }
    async createRefund(refund) {
        try {
            const result = await this.refundCollection.insertOne(refund);
            if (!result.insertedId) {
                throw new Error('Failed to create refund');
            }
            const createdRefund = await this.refundCollection.findOne({ _id: result.insertedId });
            if (!createdRefund) {
                throw new Error('Refund not found after creation');
            }
            return createdRefund;
        }
        catch (error) {
            logger_1.logger.error('Failed to create refund in database', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getStats(customerId) {
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
            const statusCounts = {
                [payment_dto_1.PaymentStatus.PENDING]: 0,
                [payment_dto_1.PaymentStatus.PROCESSING]: 0,
                [payment_dto_1.PaymentStatus.COMPLETED]: 0,
                [payment_dto_1.PaymentStatus.FAILED]: 0,
                [payment_dto_1.PaymentStatus.CANCELLED]: 0,
                [payment_dto_1.PaymentStatus.REFUNDED]: 0,
            };
            stats.statusCounts.forEach((status) => {
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            const methodCounts = {
                [payment_dto_1.PaymentMethod.CREDIT_CARD]: 0,
                [payment_dto_1.PaymentMethod.DEBIT_CARD]: 0,
                [payment_dto_1.PaymentMethod.BANK_TRANSFER]: 0,
                [payment_dto_1.PaymentMethod.PAYPAL]: 0,
                [payment_dto_1.PaymentMethod.STRIPE]: 0,
            };
            stats.methodCounts.forEach((method) => {
                methodCounts[method] = (methodCounts[method] || 0) + 1;
            });
            return {
                totalPayments: stats.totalPayments,
                totalAmount: stats.totalAmount,
                averageAmount: stats.averageAmount,
                statusCounts,
                methodCounts,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get payment statistics', {
                error: error instanceof Error ? error.message : 'Unknown error',
                customerId,
            });
            throw error;
        }
    }
}
exports.PaymentRepository = PaymentRepository;
//# sourceMappingURL=payment.repository.js.map