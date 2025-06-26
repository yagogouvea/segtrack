import { Request, Response } from 'express';
export declare class UserController {
    getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    list(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map