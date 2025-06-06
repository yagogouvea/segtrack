import { Request, Response } from 'express';
export declare class UserController {
    getCurrentUser(req: Request, res: Response): Promise<void>;
    updateCurrentUser(req: Request, res: Response): Promise<void>;
    updatePassword(req: Request, res: Response): Promise<void>;
    list(_req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map