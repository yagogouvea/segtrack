"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../shared/errors/AppError");
class OcorrenciaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.ocorrencia.findMany({
            include: {
                fotos: true
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
    }
    async findById(id) {
        const ocorrencia = await this.prisma.ocorrencia.findUnique({
            where: { id },
            include: {
                fotos: true
            }
        });
        if (!ocorrencia) {
            return null;
        }
        return {
            ...ocorrencia,
            despesas_detalhadas: ocorrencia.despesas_detalhadas || {}
        };
    }
    async create(data) {
        return this.prisma.ocorrencia.create({
            data: {
                ...data,
                status: data.status || 'em_andamento',
                despesas_detalhadas: data.despesas_detalhadas || client_1.Prisma.JsonNull
            },
            include: {
                fotos: true
            }
        });
    }
    async update(id, data) {
        return this.prisma.ocorrencia.update({
            where: { id },
            data: {
                ...data,
                status: data.status,
                despesas_detalhadas: data.despesas_detalhadas || client_1.Prisma.JsonNull
            },
            include: {
                fotos: true
            }
        });
    }
    async delete(id) {
        await this.prisma.foto.deleteMany({
            where: { ocorrenciaId: id }
        });
        await this.prisma.ocorrencia.delete({
            where: { id }
        });
    }
    async findByStatus(status) {
        return this.prisma.ocorrencia.findMany({
            where: { status },
            include: {
                fotos: true
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
    }
    async addPhotos(id, fotos) {
        return this.prisma.ocorrencia.update({
            where: { id },
            data: {
                fotos: {
                    create: fotos
                }
            },
            include: {
                fotos: true
            }
        });
    }
    async generateReport(id) {
        const ocorrencia = await this.findById(id);
        if (!ocorrencia) {
            throw new AppError_1.AppError('Ocorrência não encontrada', 404);
        }
        // Implementar geração de relatório
        // TODO: Integrar com serviço de geração de PDF
        return {
            url: `/relatorios/${id}.pdf`
        };
    }
    async list(filters = {}) {
        const where = {};
        if (filters.cliente) {
            where.cliente = filters.cliente;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.dataInicio || filters.dataFim) {
            where.criado_em = {
                gte: filters.dataInicio,
                lte: filters.dataFim
            };
        }
        return this.prisma.ocorrencia.findMany({
            where,
            include: {
                fotos: true
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
    }
    async getById(id) {
        return this.prisma.ocorrencia.findUnique({
            where: { id },
            include: {
                fotos: true
            }
        });
    }
    async addFotos(id, urls) {
        return this.prisma.ocorrencia.update({
            where: { id },
            data: {
                fotos: {
                    create: urls.map(url => ({
                        url,
                        legenda: ''
                    }))
                }
            },
            include: {
                fotos: true
            }
        });
    }
}
exports.OcorrenciaService = OcorrenciaService;
//# sourceMappingURL=ocorrencia.service.js.map