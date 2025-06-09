"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../shared/errors/AppError");
const prisma_1 = require("../../lib/prisma");
class OcorrenciaService {
    async list(filters = {}) {
        try {
            const db = (0, prisma_1.ensurePrisma)();
            const where = {};
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.placa) {
                where.OR = [
                    { placa1: filters.placa },
                    { placa2: filters.placa },
                    { placa3: filters.placa }
                ];
            }
            if (filters.cliente) {
                where.cliente = {
                    contains: filters.cliente
                };
            }
            if (filters.data_inicio || filters.data_fim) {
                where.criado_em = {};
                if (filters.data_inicio) {
                    where.criado_em.gte = filters.data_inicio;
                }
                if (filters.data_fim) {
                    where.criado_em.lte = filters.data_fim;
                }
            }
            return await db.ocorrencia.findMany({
                where,
                include: {
                    fotos: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
        }
        catch (error) {
            console.error('Erro ao listar ocorrências:', error);
            throw new AppError_1.AppError('Erro ao listar ocorrências');
        }
    }
    async create(data) {
        var _a;
        try {
            if (!data.placa1 || !data.cliente || !data.tipo) {
                throw new AppError_1.AppError('Campos obrigatórios faltando: placa1, cliente, tipo', 400);
            }
            const db = (0, prisma_1.ensurePrisma)();
            const { fotos } = data, rest = __rest(data, ["fotos"]);
            const ocorrencia = await db.ocorrencia.create({
                data: Object.assign(Object.assign({}, rest), { status: data.status || 'em_andamento', criado_em: new Date(), atualizado_em: new Date(), despesas_detalhadas: (_a = data.despesas_detalhadas) !== null && _a !== void 0 ? _a : client_1.Prisma.JsonNull }),
                include: {
                    fotos: true
                }
            });
            if (fotos && fotos.length > 0) {
                await db.foto.createMany({
                    data: fotos.map(foto => ({
                        ocorrenciaId: ocorrencia.id,
                        url: foto.url,
                        legenda: foto.legenda || ''
                    }))
                });
            }
            return await db.ocorrencia.findUnique({
                where: { id: ocorrencia.id },
                include: { fotos: true }
            });
        }
        catch (error) {
            console.error('Erro ao criar ocorrência:', error);
            throw new AppError_1.AppError('Erro ao criar ocorrência');
        }
    }
    async findById(id) {
        try {
            const db = (0, prisma_1.ensurePrisma)();
            const ocorrencia = await db.ocorrencia.findUnique({
                where: { id },
                include: {
                    fotos: true
                }
            });
            if (!ocorrencia) {
                throw new AppError_1.AppError('Ocorrência não encontrada', 404);
            }
            return ocorrencia;
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            console.error('Erro ao buscar ocorrência:', error);
            throw new AppError_1.AppError('Erro ao buscar ocorrência');
        }
    }
    async update(id, data) {
        var _a;
        try {
            const db = (0, prisma_1.ensurePrisma)();
            const { fotos } = data, rest = __rest(data, ["fotos"]);
            const ocorrencia = await db.ocorrencia.update({
                where: { id },
                data: Object.assign(Object.assign({}, rest), { atualizado_em: new Date(), despesas_detalhadas: (_a = data.despesas_detalhadas) !== null && _a !== void 0 ? _a : client_1.Prisma.JsonNull }),
                include: {
                    fotos: true
                }
            });
            if (fotos && fotos.length > 0) {
                await db.foto.createMany({
                    data: fotos.map(foto => ({
                        ocorrenciaId: ocorrencia.id,
                        url: foto.url,
                        legenda: foto.legenda || ''
                    }))
                });
            }
            return await db.ocorrencia.findUnique({
                where: { id: ocorrencia.id },
                include: { fotos: true }
            });
        }
        catch (error) {
            console.error('Erro ao atualizar ocorrência:', error);
            throw new AppError_1.AppError('Erro ao atualizar ocorrência');
        }
    }
    async delete(id) {
        try {
            const db = (0, prisma_1.ensurePrisma)();
            await db.foto.deleteMany({
                where: { ocorrenciaId: id }
            });
            await db.ocorrencia.delete({
                where: { id }
            });
        }
        catch (error) {
            console.error('Erro ao deletar ocorrência:', error);
            throw new AppError_1.AppError('Erro ao deletar ocorrência');
        }
    }
    async findByStatus(status) {
        try {
            const db = (0, prisma_1.ensurePrisma)();
            return await db.ocorrencia.findMany({
                where: { status },
                include: {
                    fotos: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar ocorrências por status:', error);
            throw new AppError_1.AppError('Erro ao buscar ocorrências por status');
        }
    }
    async findByPlaca(placa) {
        try {
            const db = (0, prisma_1.ensurePrisma)();
            return await db.ocorrencia.findMany({
                where: {
                    OR: [
                        { placa1: placa },
                        { placa2: placa },
                        { placa3: placa }
                    ]
                },
                include: {
                    fotos: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar ocorrências por placa:', error);
            throw new AppError_1.AppError('Erro ao buscar ocorrências por placa');
        }
    }
    async addFotos(id, urls) {
        try {
            const db = (0, prisma_1.ensurePrisma)();
            return await db.ocorrencia.update({
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
        catch (error) {
            console.error('Erro ao adicionar fotos:', error);
            throw new AppError_1.AppError('Erro ao adicionar fotos');
        }
    }
}
exports.OcorrenciaService = OcorrenciaService;
