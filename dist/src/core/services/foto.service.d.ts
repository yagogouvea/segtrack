import { PrismaClient } from '@prisma/client';
interface FotoUploadData {
    url: string;
    legenda: string;
    ocorrenciaId: number;
}
export declare class FotoService {
    private prisma;
    constructor(prisma: PrismaClient);
    list(): Promise<{
        url: string;
        id: number;
        createdAt: Date;
        legenda: string;
        ocorrenciaId: number;
    }[]>;
    findById(id: number): Promise<{
        url: string;
        id: number;
        createdAt: Date;
        legenda: string;
        ocorrenciaId: number;
    } | null>;
    upload(data: FotoUploadData): Promise<{
        url: string;
        id: number;
        createdAt: Date;
        legenda: string;
        ocorrenciaId: number;
    }>;
    delete(id: number): Promise<{
        url: string;
        id: number;
        createdAt: Date;
        legenda: string;
        ocorrenciaId: number;
    }>;
}
export {};
//# sourceMappingURL=foto.service.d.ts.map