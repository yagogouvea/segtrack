import { Request, Response } from 'express';
export declare class PrestadorController {
    private service;
    constructor();
    listPublic: (_req: Request, res: Response) => Promise<void>;
    list: (_req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=prestador.controller.d.ts.map