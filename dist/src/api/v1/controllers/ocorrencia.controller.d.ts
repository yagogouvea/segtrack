import { Request, Response } from 'express';
export declare class OcorrenciaController {
    private service;
    constructor();
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
    addPhotos: (req: Request, res: Response) => Promise<void>;
    generateReport: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ocorrencia.controller.d.ts.map