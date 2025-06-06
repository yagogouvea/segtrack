import { PrismaClient } from '@prisma/client';
interface ClienteData {
    nome: string;
    cnpj: string;
    contato?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    camposAdicionais?: Array<{
        label: string;
        campo: string;
    }>;
}
export declare class ClienteService {
    private prisma;
    constructor(prisma: PrismaClient);
    list(): Promise<({
        camposAdicionais: {
            id: number;
            label: string;
            campo: string;
            clienteId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        telefone: string | null;
        endereco: string | null;
        cnpj: string;
        contato: string | null;
    })[]>;
    findById(id: number): Promise<({
        camposAdicionais: {
            id: number;
            label: string;
            campo: string;
            clienteId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        telefone: string | null;
        endereco: string | null;
        cnpj: string;
        contato: string | null;
    }) | null>;
    create(data: ClienteData): Promise<{
        camposAdicionais: {
            id: number;
            label: string;
            campo: string;
            clienteId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        telefone: string | null;
        endereco: string | null;
        cnpj: string;
        contato: string | null;
    }>;
    update(id: number, data: Partial<ClienteData>): Promise<{
        camposAdicionais: {
            id: number;
            label: string;
            campo: string;
            clienteId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        telefone: string | null;
        endereco: string | null;
        cnpj: string;
        contato: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        email: string | null;
        nome: string;
        telefone: string | null;
        endereco: string | null;
        cnpj: string;
        contato: string | null;
    }>;
}
export {};
//# sourceMappingURL=cliente.service.d.ts.map