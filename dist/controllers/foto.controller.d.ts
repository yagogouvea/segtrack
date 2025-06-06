import { Request, Response } from 'express';
export declare class FotoController {
    private service;
    constructor();
    list: (_req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    upload: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=foto.controller.d.ts.map