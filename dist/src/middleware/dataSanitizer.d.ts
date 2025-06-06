import { Request, Response, NextFunction } from 'express';
interface SanitizedOcorrencia {
    id: number;
    tipo: string;
    status: string;
    data_acionamento: string;
    cliente?: string;
    tipo_veiculo?: string;
    coordenadas?: string;
}
export declare const sanitizeOcorrenciaData: (data: any) => SanitizedOcorrencia;
export declare function sanitizeResponseData(): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=dataSanitizer.d.ts.map