"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_1 = require("@shared/db/mongo");
const user_dto_1 = require("../../domain/dtos/user.dto");
const logger_1 = require("@libraries/logger");
class UserRepository {
    collection;
    constructor() {
        this.collection = (0, mongo_1.getDb)().collection('users');
    }
    async create(user) {
        try {
            const result = await this.collection.insertOne(user);
            if (!result.insertedId) {
                throw new Error('Failed to create user');
            }
            const createdUser = await this.collection.findOne({ _id: result.insertedId });
            if (!createdUser) {
                throw new Error('User not found after creation');
            }
            return createdUser;
        }
        catch (error) {
            logger_1.logger.error('Failed to create user in database', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async findById(userId) {
        try {
            if (!mongodb_1.ObjectId.isValid(userId)) {
                return null;
            }
            return await this.collection.findOne({ _id: userId });
        }
        catch (error) {
            logger_1.logger.error('Failed to find user by ID', {
                error: error instanceof Error ? error.message : 'Unknown error',
                userId,
            });
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            return await this.collection.findOne({ email: email.toLowerCase() });
        }
        catch (error) {
            logger_1.logger.error('Failed to find user by email', {
                error: error instanceof Error ? error.message : 'Unknown error',
                email,
            });
            throw error;
        }
    }
    async findMany(query) {
        try {
            const filter = {};
            if (query.role) {
                filter.role = query.role;
            }
            if (query.isActive !== undefined) {
                filter.isActive = query.isActive;
            }
            if (query.search) {
                filter.$or = [
                    { firstName: { $regex: query.search, $options: 'i' } },
                    { lastName: { $regex: query.search, $options: 'i' } },
                    { email: { $regex: query.search, $options: 'i' } },
                ];
            }
            const sort = {};
            sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
            const skip = (query.page - 1) * query.limit;
            const [users, total] = await Promise.all([
                this.collection.find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
                this.collection.countDocuments(filter),
            ]);
            return { users, total };
        }
        catch (error) {
            logger_1.logger.error('Failed to find users', {
                error: error instanceof Error ? error.message : 'Unknown error',
                query,
            });
            throw error;
        }
    }
    async update(userId, updateData) {
        try {
            if (!mongodb_1.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            const result = await this.collection.findOneAndUpdate({ _id: userId }, { $set: updateData }, { returnDocument: 'after' });
            if (!result) {
                throw new Error('User not found');
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to update user', {
                error: error instanceof Error ? error.message : 'Unknown error',
                userId,
            });
            throw error;
        }
    }
    async updateLastLogin(userId) {
        try {
            if (!mongodb_1.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            await this.collection.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
        }
        catch (error) {
            logger_1.logger.error('Failed to update last login', {
                error: error instanceof Error ? error.message : 'Unknown error',
                userId,
            });
            throw error;
        }
    }
    async delete(userId) {
        try {
            if (!mongodb_1.ObjectId.isValid(userId)) {
                return false;
            }
            const result = await this.collection.deleteOne({ _id: userId });
            return result.deletedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete user', {
                error: error instanceof Error ? error.message : 'Unknown error',
                userId,
            });
            throw error;
        }
    }
    async getStats() {
        try {
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
                        },
                        inactiveUsers: {
                            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] },
                        },
                        roleCounts: {
                            $push: '$role',
                        },
                    },
                },
                {
                    $project: {
                        totalUsers: 1,
                        activeUsers: 1,
                        inactiveUsers: 1,
                        roleCounts: 1,
                    },
                },
            ];
            const result = await this.collection.aggregate(pipeline).toArray();
            const stats = result[0] || {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                roleCounts: [],
            };
            const roleCounts = {
                [user_dto_1.UserRole.USER]: 0,
                [user_dto_1.UserRole.ADMIN]: 0,
                [user_dto_1.UserRole.MODERATOR]: 0,
            };
            stats.roleCounts.forEach((role) => {
                roleCounts[role] = (roleCounts[role] || 0) + 1;
            });
            return {
                totalUsers: stats.totalUsers,
                activeUsers: stats.activeUsers,
                inactiveUsers: stats.inactiveUsers,
                roleCounts,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get user statistics', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map