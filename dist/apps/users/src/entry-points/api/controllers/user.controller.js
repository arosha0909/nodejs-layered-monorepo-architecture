"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../../../domain/services/user.service");
const user_repository_1 = require("../../../data-access/repositories/user.repository");
const user_dto_1 = require("../../../domain/dtos/user.dto");
const errors_1 = require("@shared/errors");
class UserController {
    userService;
    constructor() {
        this.userService = new user_service_1.UserService(new user_repository_1.UserRepository());
    }
    register = async (req, res, next) => {
        try {
            const validatedData = user_dto_1.CreateUserSchema.parse(req.body);
            const user = await this.userService.createUser(validatedData);
            res.status(201).json({
                success: true,
                data: user,
                message: 'User registered successfully',
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
    login = async (req, res, next) => {
        try {
            const validatedData = user_dto_1.LoginSchema.parse(req.body);
            const result = await this.userService.login(validatedData);
            res.json({
                success: true,
                data: result,
                message: 'Login successful',
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
    getProfile = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw errors_1.OperationalError.unauthorized('User not authenticated');
            }
            const user = await this.userService.getUserById(userId);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getUserById = async (req, res, next) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw errors_1.OperationalError.badRequest('User ID is required');
            }
            const user = await this.userService.getUserById(userId);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getUsers = async (req, res, next) => {
        try {
            const validatedQuery = user_dto_1.UserQuerySchema.parse(req.query);
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
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                next(errors_1.OperationalError.badRequest('Invalid query parameters'));
                return;
            }
            next(error);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw errors_1.OperationalError.unauthorized('User not authenticated');
            }
            const validatedData = user_dto_1.UpdateUserSchema.parse(req.body);
            const user = await this.userService.updateUser(userId, validatedData);
            res.json({
                success: true,
                data: user,
                message: 'Profile updated successfully',
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
    updateUser = async (req, res, next) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw errors_1.OperationalError.badRequest('User ID is required');
            }
            const validatedData = user_dto_1.UpdateUserSchema.parse(req.body);
            const user = await this.userService.updateUser(userId, validatedData);
            res.json({
                success: true,
                data: user,
                message: 'User updated successfully',
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
    changePassword = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw errors_1.OperationalError.unauthorized('User not authenticated');
            }
            const validatedData = user_dto_1.ChangePasswordSchema.parse(req.body);
            await this.userService.changePassword(userId, validatedData);
            res.json({
                success: true,
                message: 'Password changed successfully',
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
    deactivateAccount = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw errors_1.OperationalError.unauthorized('User not authenticated');
            }
            const user = await this.userService.deactivateUser(userId);
            res.json({
                success: true,
                data: user,
                message: 'Account deactivated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    getUserStats = async (_req, res, next) => {
        try {
            const stats = await this.userService.getUserStats();
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
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map