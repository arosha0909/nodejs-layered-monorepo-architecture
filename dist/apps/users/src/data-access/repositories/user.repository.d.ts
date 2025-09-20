import { User, UserQueryDto, UserRole } from '../../domain/dtos/user.dto';
export declare class UserRepository {
    private collection;
    constructor();
    create(user: Omit<User, '_id'>): Promise<User>;
    findById(userId: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findMany(query: UserQueryDto): Promise<{
        users: User[];
        total: number;
    }>;
    update(userId: string, updateData: Partial<User>): Promise<User>;
    updateLastLogin(userId: string): Promise<void>;
    delete(userId: string): Promise<boolean>;
    getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        roleCounts: Record<UserRole, number>;
    }>;
}
//# sourceMappingURL=user.repository.d.ts.map