"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const authenticator_1 = require("@libraries/authenticator");
const errors_1 = require("@shared/errors");
const logger_1 = require("@libraries/logger");
const environment_1 = require("@config/environment");
class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(createUserDto) {
        try {
            const existingUser = await this.userRepository.findByEmail(createUserDto.email);
            if (existingUser) {
                throw errors_1.OperationalError.conflict('User with this email already exists');
            }
            const passwordValidation = authenticator_1.Authenticator.validatePassword(createUserDto.password);
            if (!passwordValidation.valid) {
                throw errors_1.OperationalError.badRequest(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }
            const hashedPassword = await authenticator_1.Authenticator.hashPassword(createUserDto.password);
            const user = {
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
            logger_1.logger.info('User created successfully', {
                userId: createdUser._id,
                email: createdUser.email,
                role: createdUser.role,
            });
            return this.toUserResponse(createdUser);
        }
        catch (error) {
            logger_1.logger.error('Failed to create user', {
                error: error instanceof Error ? error.message : 'Unknown error',
                email: createUserDto.email,
            });
            throw error;
        }
    }
    async login(loginDto) {
        try {
            const user = await this.userRepository.findByEmail(loginDto.email.toLowerCase());
            if (!user) {
                throw errors_1.OperationalError.unauthorized('Invalid email or password');
            }
            if (!user.isActive) {
                throw errors_1.OperationalError.unauthorized('Account is deactivated');
            }
            const isPasswordValid = await authenticator_1.Authenticator.comparePassword(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw errors_1.OperationalError.unauthorized('Invalid email or password');
            }
            await this.userRepository.updateLastLogin(user._id);
            const token = authenticator_1.Authenticator.generateToken({
                userId: user._id,
                email: user.email,
                role: user.role,
            });
            logger_1.logger.info('User logged in successfully', {
                userId: user._id,
                email: user.email,
                role: user.role,
            });
            return {
                user: this.toUserResponse(user),
                token,
                expiresIn: environment_1.config.security.jwtExpiresIn,
            };
        }
        catch (error) {
            logger_1.logger.error('Login failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                email: loginDto.email,
            });
            throw error;
        }
    }
    async getUserById(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw errors_1.OperationalError.notFound('User not found');
        }
        return this.toUserResponse(user);
    }
    async getUsers(query) {
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
    async updateUser(userId, updateDto) {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw errors_1.OperationalError.notFound('User not found');
        }
        const updateData = {
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
        logger_1.logger.info('User updated successfully', {
            userId: updatedUser._id,
            email: updatedUser.email,
        });
        return this.toUserResponse(updatedUser);
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw errors_1.OperationalError.notFound('User not found');
        }
        const isCurrentPasswordValid = await authenticator_1.Authenticator.comparePassword(changePasswordDto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw errors_1.OperationalError.badRequest('Current password is incorrect');
        }
        const passwordValidation = authenticator_1.Authenticator.validatePassword(changePasswordDto.newPassword);
        if (!passwordValidation.valid) {
            throw errors_1.OperationalError.badRequest(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        }
        const hashedPassword = await authenticator_1.Authenticator.hashPassword(changePasswordDto.newPassword);
        await this.userRepository.update(userId, {
            password: hashedPassword,
            updatedAt: new Date(),
        });
        logger_1.logger.info('User password changed successfully', {
            userId: user._id,
            email: user.email,
        });
    }
    async deactivateUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw errors_1.OperationalError.notFound('User not found');
        }
        if (!user.isActive) {
            throw errors_1.OperationalError.badRequest('User account is already deactivated');
        }
        const updatedUser = await this.userRepository.update(userId, {
            isActive: false,
            updatedAt: new Date(),
        });
        logger_1.logger.info('User account deactivated', {
            userId: updatedUser._id,
            email: updatedUser.email,
        });
        return this.toUserResponse(updatedUser);
    }
    async getUserStats() {
        return this.userRepository.getStats();
    }
    toUserResponse(user) {
        const { password, ...userResponse } = user;
        return userResponse;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map