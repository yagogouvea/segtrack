import { Request, Response } from 'express';
export declare class FotoController {
    private service;
    constructor();
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    upload: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=foto.controller.d.ts.map