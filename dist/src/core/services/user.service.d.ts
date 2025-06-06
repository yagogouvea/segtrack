interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: string;
    permissions?: string[];
}
interface UpdateUserData {
    name?: string;
    email?: string;
    role?: string;
    permissions?: string[];
    active?: boolean;
}
export declare class UserService {
    list(): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(data: CreateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(id: string, currentPassword: string, newPassword: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
//# sourceMappingURL=user.service.d.ts.map