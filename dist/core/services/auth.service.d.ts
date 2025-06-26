interface LoginData {
    email: string;
    password: string;
}
interface TokenData {
    userId: string;
    role: string;
    email: string;
    permissions: string[];
}
export declare class AuthService {
    login(data: LoginData): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    validateToken(token: string): Promise<TokenData>;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map