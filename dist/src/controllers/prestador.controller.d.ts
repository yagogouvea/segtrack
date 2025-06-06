import { Request, Response } from 'express';
export declare class PrestadorController {
    private service;
    constructor();
    listPublic: (req: Request, res: Response) => Promise<void>;
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=prestador.controller.d.ts.map