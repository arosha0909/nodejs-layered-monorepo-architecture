/**
 * @fileoverview User API controller - Express layer
 * @author Node.js Best Practices
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../../domain/services/user.service';
import { UserRepository } from '../../../data-access/repositories/user.repository';
import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
  LoginSchema,
  UserQuerySchema,
} from '../../../domain/dtos/user.dto';
import { OperationalError } from '@shared/errors';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
  }

  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateUserSchema.parse(req.body);
      const user = await this.userService.createUser(validatedData);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * User login
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await this.userService.login(validatedData);

      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Get current user profile
   */
  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw OperationalError.unauthorized('User not authenticated');
      }

      const user = await this.userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw OperationalError.badRequest('User ID is required');
      }
      const user = await this.userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users with pagination and filtering
   */
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = UserQuerySchema.parse(req.query);
      const result = await this.userService.getUsers(validatedQuery);

      res.json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid query parameters'));
        return;
      }
      next(error);
    }
  };

  /**
   * Update user profile
   */
  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw OperationalError.unauthorized('User not authenticated');
      }

      const validatedData = UpdateUserSchema.parse(req.body);
      const user = await this.userService.updateUser(userId, validatedData);

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Update user by ID (admin only)
   */
  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw OperationalError.badRequest('User ID is required');
      }
      const validatedData = UpdateUserSchema.parse(req.body);
      const user = await this.userService.updateUser(userId, validatedData);

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Change password
   */
  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw OperationalError.unauthorized('User not authenticated');
      }

      const validatedData = ChangePasswordSchema.parse(req.body);
      await this.userService.changePassword(userId, validatedData);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(OperationalError.badRequest('Invalid request data'));
        return;
      }
      next(error);
    }
  };

  /**
   * Deactivate user account
   */
  public deactivateAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw OperationalError.unauthorized('User not authenticated');
      }

      const user = await this.userService.deactivateUser(userId);

      res.json({
        success: true,
        data: user,
        message: 'Account deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user statistics (admin only)
   */
  public getUserStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
