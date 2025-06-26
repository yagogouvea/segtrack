import { PrismaClient } from '@prisma/client';
interface VeiculoData {
    placa: string;
    modelo?: string;
    marca?: string;
    cor?: string;
    fabricante?: string;
    ano?: number;
}
export declare class VeiculoService {
    private prisma;
    constructor(prisma: PrismaClient);
    list(): Promise<{
        id: number;
        createdAt: Date;
        placa: string;
        modelo: string | null;
        marca: string | null;
        cor: string | null;
        fabricante: string | null;
        ano: number | null;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        createdAt: Date;
        placa: string;
        modelo: string | null;
        marca: string | null;
        cor: string | null;
        fabricante: string | null;
        ano: number | null;
    } | null>;
    create(data: VeiculoData): Promise<{
        id: number;
        createdAt: Date;
        placa: string;
        modelo: string | null;
        marca: string | null;
        cor: string | null;
        fabricante: string | null;
        ano: number | null;
    }>;
    update(id: number, data: Partial<VeiculoData>): Promise<{
        id: number;
        createdAt: Date;
        placa: string;
        modelo: string | null;
        marca: string | null;
        cor: string | null;
        fabricante: string | null;
        ano: number | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        placa: string;
        modelo: string | null;
        marca: string | null;
        cor: string | null;
        fabricante: string | null;
        ano: number | null;
    }>;
}
export {};
//# sourceMappingURL=veiculo.service.d.ts.map