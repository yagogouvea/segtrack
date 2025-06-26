"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioService = void 0;
class RelatorioService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async gerarRelatorioOcorrencias(dataInicio, dataFim) {
        return this.prisma.ocorrencia.findMany({
            where: {
                criado_em: {
                    gte: new Date(dataInicio),
                    lte: new Date(dataFim)
                }
            },
            include: {
                fotos: true
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
    }
    async gerarRelatorioPrestadores(dataInicio, dataFim) {
        return this.prisma.prestador.findMany({
            where: {
                criado_em: {
                    gte: new Date(dataInicio),
                    lte: new Date(dataFim)
                }
            },
            include: {
                funcoes: true,
                regioes: true,
                veiculos: true
            },
            orderBy: {
                nome: 'asc'
            }
        });
    }
    async gerarRelatorioClientes(dataInicio, dataFim) {
        const ocorrencias = await this.prisma.ocorrencia.groupBy({
            by: ['cliente'],
            where: {
                criado_em: {
                    gte: new Date(dataInicio),
                    lte: new Date(dataFim)
                }
            },
            _count: {
                id: true
            },
            _sum: {
                despesas: true
            }
        });
        return ocorrencias.map(o => ({
            cliente: o.cliente,
            total_ocorrencias: o._count.id,
            total_despesas: o._sum.despesas || 0
        }));
    }
    async gerarRelatorioFinanceiro(dataInicio, dataFim) {
        const ocorrencias = await this.prisma.ocorrencia.findMany({
            where: {
                criado_em: {
                    gte: new Date(dataInicio),
                    lte: new Date(dataFim)
                }
            },
            select: {
                id: true,
                cliente: true,
                prestador: true,
                despesas: true,
                despesas_detalhadas: true,
                criado_em: true
            }
        });
        const totalDespesas = ocorrencias.reduce((acc, curr) => acc + (curr.despesas || 0), 0);
        const totalOcorrencias = ocorrencias.length;
        return {
            periodo: {
                inicio: dataInicio,
                fim: dataFim
            },
            resumo: {
                total_ocorrencias: totalOcorrencias,
                total_despesas: totalDespesas,
                media_por_ocorrencia: totalOcorrencias > 0 ? totalDespesas / totalOcorrencias : 0
            },
            ocorrencias: ocorrencias.map(o => ({
                id: o.id,
                cliente: o.cliente,
                prestador: o.prestador,
                despesas: o.despesas,
                detalhamento: o.despesas_detalhadas,
                data: o.criado_em
            }))
        };
    }
}
exports.RelatorioService = RelatorioService;
//# sourceMappingURL=relatorio.service.js.map