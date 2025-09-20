"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_1 = require("@shared/db/mongo");
const order_dto_1 = require("../../domain/dtos/order.dto");
const logger_1 = require("@libraries/logger");
class OrderRepository {
    collection;
    constructor() {
        this.collection = (0, mongo_1.getDb)().collection('orders');
    }
    async create(order) {
        try {
            const result = await this.collection.insertOne(order);
            if (!result.insertedId) {
                throw new Error('Failed to create order');
            }
            const createdOrder = await this.collection.findOne({ _id: result.insertedId });
            if (!createdOrder) {
                throw new Error('Order not found after creation');
            }
            return createdOrder;
        }
        catch (error) {
            logger_1.logger.error('Failed to create order in database', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async findById(orderId) {
        try {
            if (!mongodb_1.ObjectId.isValid(orderId)) {
                return null;
            }
            return await this.collection.findOne({ _id: orderId });
        }
        catch (error) {
            logger_1.logger.error('Failed to find order by ID', {
                error: error instanceof Error ? error.message : 'Unknown error',
                orderId,
            });
            throw error;
        }
    }
    async findByOrderNumber(orderNumber) {
        try {
            return await this.collection.findOne({ orderNumber });
        }
        catch (error) {
            logger_1.logger.error('Failed to find order by order number', {
                error: error instanceof Error ? error.message : 'Unknown error',
                orderNumber,
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
            if (query.customerId) {
                filter.customerId = query.customerId;
            }
            const sort = {};
            sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
            const skip = (query.page - 1) * query.limit;
            const [orders, total] = await Promise.all([
                this.collection.find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
                this.collection.countDocuments(filter),
            ]);
            return { orders, total };
        }
        catch (error) {
            logger_1.logger.error('Failed to find orders', {
                error: error instanceof Error ? error.message : 'Unknown error',
                query,
            });
            throw error;
        }
    }
    async update(orderId, updateData) {
        try {
            if (!mongodb_1.ObjectId.isValid(orderId)) {
                throw new Error('Invalid order ID');
            }
            const result = await this.collection.findOneAndUpdate({ _id: orderId }, { $set: updateData }, { returnDocument: 'after' });
            if (!result) {
                throw new Error('Order not found');
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to update order', {
                error: error instanceof Error ? error.message : 'Unknown error',
                orderId,
            });
            throw error;
        }
    }
    async delete(orderId) {
        try {
            if (!mongodb_1.ObjectId.isValid(orderId)) {
                return false;
            }
            const result = await this.collection.deleteOne({ _id: orderId });
            return result.deletedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete order', {
                error: error instanceof Error ? error.message : 'Unknown error',
                orderId,
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
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$total' },
                        statusCounts: {
                            $push: '$status',
                        },
                    },
                },
                {
                    $project: {
                        totalOrders: 1,
                        totalRevenue: 1,
                        averageOrderValue: {
                            $cond: {
                                if: { $gt: ['$totalOrders', 0] },
                                then: { $divide: ['$totalRevenue', '$totalOrders'] },
                                else: 0,
                            },
                        },
                        statusCounts: 1,
                    },
                },
            ];
            const result = await this.collection.aggregate(pipeline).toArray();
            const stats = result[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                statusCounts: [],
            };
            const statusCounts = {
                [order_dto_1.OrderStatus.PENDING]: 0,
                [order_dto_1.OrderStatus.CONFIRMED]: 0,
                [order_dto_1.OrderStatus.PROCESSING]: 0,
                [order_dto_1.OrderStatus.SHIPPED]: 0,
                [order_dto_1.OrderStatus.DELIVERED]: 0,
                [order_dto_1.OrderStatus.CANCELLED]: 0,
            };
            stats.statusCounts.forEach((status) => {
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            return {
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
                averageOrderValue: stats.averageOrderValue,
                statusCounts,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get order statistics', {
                error: error instanceof Error ? error.message : 'Unknown error',
                customerId,
            });
            throw error;
        }
    }
}
exports.OrderRepository = OrderRepository;
//# sourceMappingURL=order.repository.js.map