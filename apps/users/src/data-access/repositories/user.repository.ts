/**
 * @fileoverview User repository - MongoDB data access layer
 * @author Node.js Best Practices
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@shared/db/mongo';
import { User, UserQueryDto, UserRole } from '../../domain/dtos/user.dto';
import { logger } from '@libraries/logger';

export class UserRepository {
  private get collection(): Collection<User> {
    return getDb().collection<User>('users');
  }

  /**
   * Create a new user
   */
  public async create(user: Omit<User, '_id'>): Promise<User> {
    try {
      const result = await this.collection.insertOne(user as User);

      if (!result.insertedId) {
        throw new Error('Failed to create user');
      }

      const createdUser = await this.collection.findOne({ _id: result.insertedId });

      if (!createdUser) {
        throw new Error('User not found after creation');
      }

      return createdUser;
    } catch (error) {
      logger.error('Failed to create user in database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  public async findById(userId: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(userId)) {
        return null;
      }

      return await this.collection.findOne({ _id: userId as any });
    } catch (error) {
      logger.error('Failed to find user by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.collection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error('Failed to find user by email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw error;
    }
  }

  /**
   * Find users with pagination and filtering
   */
  public async findMany(query: UserQueryDto): Promise<{
    users: User[];
    total: number;
  }> {
    try {
      // Build filter
      const filter: any = {};

      if (query.role) {
        filter.role = query.role;
      }

      if (query.isActive !== undefined) {
        filter.isActive = query.isActive;
      }

      // Add search functionality
      if (query.search) {
        filter.$or = [
          { firstName: { $regex: query.search, $options: 'i' } },
          { lastName: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

      // Calculate skip
      const skip = (query.page - 1) * query.limit;

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        this.collection.find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
        this.collection.countDocuments(filter),
      ]);

      return { users, total };
    } catch (error) {
      logger.error('Failed to find users', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
      });
      throw error;
    }
  }

  /**
   * Update user
   */
  public async update(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: userId as any },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('User not found');
      }

      return result;
    } catch (error) {
      logger.error('Failed to update user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  public async updateLastLogin(userId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      await this.collection.updateOne(
        { _id: userId as any },
        { $set: { lastLoginAt: new Date() } }
      );
    } catch (error) {
      logger.error('Failed to update last login', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete user
   */
  public async delete(userId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(userId)) {
        return false;
      }

      const result = await this.collection.deleteOne({ _id: userId as any });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to delete user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  public async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    roleCounts: Record<UserRole, number>;
  }> {
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

      // Count role occurrences
      const roleCounts: Record<UserRole, number> = {
        [UserRole.USER]: 0,
        [UserRole.ADMIN]: 0,
        [UserRole.MODERATOR]: 0,
      };

      stats.roleCounts.forEach((role: UserRole) => {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });

      return {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        roleCounts,
      };
    } catch (error) {
      logger.error('Failed to get user statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
