import { Prisma } from '@prisma/client';
interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: Prisma.JsonValue;
    };
}
export declare class AuthService {
    private readonly JWT_SECRET;
    login(email: string, password: string): Promise<LoginResponse>;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map