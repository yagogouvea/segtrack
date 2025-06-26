import { PrismaClient, Ocorrencia } from '@prisma/client';
import { CreateOcorrenciaDTO, UpdateOcorrenciaDTO } from '../../types/prisma';
type OcorrenciaStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando';
interface ListOcorrenciaFilters {
    cliente?: string;
    status?: OcorrenciaStatus;
    dataInicio?: Date;
    dataFim?: Date;
}
export declare class OcorrenciaService {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(): Promise<Ocorrencia[]>;
    findById(id: number): Promise<Ocorrencia | null>;
    create(data: CreateOcorrenciaDTO): Promise<Ocorrencia>;
    update(id: number, data: UpdateOcorrenciaDTO): Promise<Ocorrencia>;
    delete(id: number): Promise<void>;
    findByStatus(status: OcorrenciaStatus): Promise<Ocorrencia[]>;
    addPhotos(id: number, fotos: {
        url: string;
        legenda: string;
    }[]): Promise<Ocorrencia>;
    generateReport(id: number): Promise<{
        url: string;
    }>;
    list(filters?: ListOcorrenciaFilters): Promise<Ocorrencia[]>;
    getById(id: number): Promise<Ocorrencia | null>;
    addFotos(id: number, urls: string[]): Promise<Ocorrencia>;
}
export {};
//# sourceMappingURL=ocorrencia.service.d.ts.map