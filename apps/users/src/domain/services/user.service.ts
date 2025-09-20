/**
 * @fileoverview User domain service - core business logic
 * @author Node.js Best Practices
 */

import {
  User,
  UserResponse,
  UserRole,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  LoginDto,
  LoginResponse,
  UserQueryDto,
} from '../dtos/user.dto';
import { UserRepository } from '../../data-access/repositories/user.repository';
import { Authenticator } from '@libraries/authenticator';
import { OperationalError } from '@shared/errors';
import { logger } from '@libraries/logger';
import { config } from '@config/environment';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Create a new user
   */
  public async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(createUserDto.email);
      if (existingUser) {
        throw OperationalError.conflict('User with this email already exists');
      }

      // Validate password strength
      const passwordValidation = Authenticator.validatePassword(createUserDto.password);
      if (!passwordValidation.valid) {
        throw OperationalError.badRequest(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`
        );
      }

      // Hash password
      const hashedPassword = await Authenticator.hashPassword(createUserDto.password);

      const user: Omit<User, '_id'> = {
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        phone: createUserDto.phone || undefined,
        dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdUser = await this.userRepository.create(user);

      logger.info('User created successfully', {
        userId: createdUser._id,
        email: createdUser.email,
        role: createdUser.role,
      });

      return this.toUserResponse(createdUser);
    } catch (error) {
      logger.error('Failed to create user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: createUserDto.email,
      });
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  public async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.userRepository.findByEmail(loginDto.email.toLowerCase());

      if (!user) {
        throw OperationalError.unauthorized('Invalid email or password');
      }

      if (!user.isActive) {
        throw OperationalError.unauthorized('Account is deactivated');
      }

      const isPasswordValid = await Authenticator.comparePassword(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw OperationalError.unauthorized('Invalid email or password');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user._id!);

      // Generate JWT token
      const token = Authenticator.generateToken({
        userId: user._id!,
        email: user.email,
        role: user.role,
      });

      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: this.toUserResponse(user),
        token,
        expiresIn: config.security.jwtExpiresIn,
      };
    } catch (error) {
      logger.error('Login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: loginDto.email,
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw OperationalError.notFound('User not found');
    }

    return this.toUserResponse(user);
  }

  /**
   * Get users with pagination and filtering
   */
  public async getUsers(query: UserQueryDto): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { users, total } = await this.userRepository.findMany(query);

    const totalPages = Math.ceil(total / query.limit);

    return {
      users: users.map(user => this.toUserResponse(user)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  /**
   * Update user
   */
  public async updateUser(userId: string, updateDto: UpdateUserDto): Promise<UserResponse> {
    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser) {
      throw OperationalError.notFound('User not found');
    }

    const updateData: Partial<User> = {
      updatedAt: new Date(),
    };

    if (updateDto.firstName !== undefined) {
      updateData.firstName = updateDto.firstName;
    }
    if (updateDto.lastName !== undefined) {
      updateData.lastName = updateDto.lastName;
    }
    if (updateDto.phone !== undefined) {
      updateData.phone = updateDto.phone;
    }
    if (updateDto.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(updateDto.dateOfBirth);
    }
    if (updateDto.isActive !== undefined) {
      updateData.isActive = updateDto.isActive;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);

    logger.info('User updated successfully', {
      userId: updatedUser._id,
      email: updatedUser.email,
    });

    return this.toUserResponse(updatedUser);
  }

  /**
   * Change user password
   */
  public async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw OperationalError.notFound('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await Authenticator.comparePassword(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw OperationalError.badRequest('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = Authenticator.validatePassword(changePasswordDto.newPassword);
    if (!passwordValidation.valid) {
      throw OperationalError.badRequest(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Hash new password
    const hashedPassword = await Authenticator.hashPassword(changePasswordDto.newPassword);

    await this.userRepository.update(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    logger.info('User password changed successfully', {
      userId: user._id,
      email: user.email,
    });
  }

  /**
   * Deactivate user account
   */
  public async deactivateUser(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw OperationalError.notFound('User not found');
    }

    if (!user.isActive) {
      throw OperationalError.badRequest('User account is already deactivated');
    }

    const updatedUser = await this.userRepository.update(userId, {
      isActive: false,
      updatedAt: new Date(),
    });

    logger.info('User account deactivated', {
      userId: updatedUser._id,
      email: updatedUser.email,
    });

    return this.toUserResponse(updatedUser);
  }

  /**
   * Get user statistics
   */
  public async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    roleCounts: Record<UserRole, number>;
  }> {
    return this.userRepository.getStats();
  }

  /**
   * Convert User to UserResponse (remove password)
   */
  private toUserResponse(user: User): UserResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user;
    return userResponse;
  }
}
