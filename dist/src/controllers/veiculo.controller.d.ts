import { Request, Response } from 'express';
export declare class VeiculoController {
    private service;
    constructor();
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=veiculo.controller.d.ts.map