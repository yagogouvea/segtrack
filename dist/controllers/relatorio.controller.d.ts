import { Request, Response } from 'express';
export declare class RelatorioController {
    private service;
    constructor();
    gerarRelatorioOcorrencias: (req: Request, res: Response) => Promise<void>;
    gerarRelatorioPrestadores: (req: Request, res: Response) => Promise<void>;
    gerarRelatorioClientes: (req: Request, res: Response) => Promise<void>;
    gerarRelatorioFinanceiro: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=relatorio.controller.d.ts.map