import { PrismaClient } from '@prisma/client';
export declare class RelatorioService {
    private prisma;
    constructor(prisma: PrismaClient);
    gerarRelatorioOcorrencias(dataInicio: string, dataFim: string): Promise<({
        fotos: {
            url: string;
            id: number;
            createdAt: Date;
            legenda: string;
            ocorrenciaId: number;
        }[];
    } & {
        cliente: string;
        prestador: string | null;
        id: number;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        criado_em: Date;
        tipo: string;
        placa1: string;
        placa2: string | null;
        placa3: string | null;
        modelo1: string | null;
        cor1: string | null;
        tipo_veiculo: string | null;
        coordenadas: string | null;
        cpf_condutor: string | null;
        nome_condutor: string | null;
        transportadora: string | null;
        valor_carga: number | null;
        notas_fiscais: string | null;
        os: string | null;
        origem_bairro: string | null;
        origem_cidade: string | null;
        origem_estado: string | null;
        inicio: Date | null;
        chegada: Date | null;
        termino: Date | null;
        km: number | null;
        despesas: number | null;
        descricao: string | null;
        resultado: string | null;
        status: import(".prisma/client").$Enums.OcorrenciaStatus;
        encerrada_em: Date | null;
        atualizado_em: Date;
        data_acionamento: Date | null;
        km_final: number | null;
        km_inicial: number | null;
        despesas_detalhadas: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    gerarRelatorioPrestadores(dataInicio: string, dataFim: string): Promise<({
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    })[]>;
    gerarRelatorioClientes(dataInicio: string, dataFim: string): Promise<{
        cliente: string;
        total_ocorrencias: number;
        total_despesas: number;
    }[]>;
    gerarRelatorioFinanceiro(dataInicio: string, dataFim: string): Promise<{
        periodo: {
            inicio: string;
            fim: string;
        };
        resumo: {
            total_ocorrencias: number;
            total_despesas: number;
            media_por_ocorrencia: number;
        };
        ocorrencias: {
            id: number;
            cliente: string;
            prestador: string | null;
            despesas: number | null;
            detalhamento: import("@prisma/client/runtime/library").JsonValue;
            data: Date;
        }[];
    }>;
}
//# sourceMappingURL=relatorio.service.d.ts.map