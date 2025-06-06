import { Request, Response, NextFunction } from 'express';
interface AuthUser {
    id: string;
    name: string;
    role: string;
    email: string;
    permissions: string[];
}
type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'upload';
type ResourceType = 'ocorrencia' | 'foto' | 'user' | 'admin' | 'manager' | 'dashboard' | 'relatorio' | 'cliente' | 'prestador';
type Permission = `${PermissionAction}:${ResourceType}`;
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePermission: (permission: Permission) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map