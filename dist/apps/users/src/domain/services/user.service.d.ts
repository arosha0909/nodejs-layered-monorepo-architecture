import { UserResponse, UserRole, CreateUserDto, UpdateUserDto, ChangePasswordDto, LoginDto, LoginResponse, UserQueryDto } from '../dtos/user.dto';
import { UserRepository } from '../../data-access/repositories/user.repository';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    createUser(createUserDto: CreateUserDto): Promise<UserResponse>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
    getUserById(userId: string): Promise<UserResponse>;
    getUsers(query: UserQueryDto): Promise<{
        users: UserResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateUser(userId: string, updateDto: UpdateUserDto): Promise<UserResponse>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    deactivateUser(userId: string): Promise<UserResponse>;
    getUserStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        roleCounts: Record<UserRole, number>;
    }>;
    private toUserResponse;
}
//# sourceMappingURL=user.service.d.ts.map