"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class OcorrenciaController {
    async list(req, res) {
        try {
            const { cliente, status, dataInicio, dataFim } = req.query;
            const filters = {
                cliente: cliente,
                status: status,
                dataInicio: dataInicio ? new Date(dataInicio) : undefined,
                dataFim: dataFim ? new Date(dataFim) : undefined
            };
            const ocorrencias = await prisma.ocorrencia.findMany({
                where: {
                    ...(filters.cliente && { cliente: filters.cliente }),
                    ...(filters.status && { status: filters.status }),
                    ...(filters.dataInicio || filters.dataFim) && {
                        criado_em: {
                            gte: filters.dataInicio,
                            lte: filters.dataFim
                        }
                    }
                },
                include: {
                    fotos: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
            res.json(ocorrencias);
        }
        catch (error) {
            console.error('Erro ao listar ocorrências:', error);
            res.status(500).json({ error: 'Erro ao listar ocorrências' });
        }
    }
    async create(req, res) {
        try {
            const data = req.body;
            const ocorrencia = await prisma.ocorrencia.create({
                data: {
                    ...data,
                    status: data.status,
                    despesas_detalhadas: data.despesas_detalhadas ?
                        data.despesas_detalhadas :
                        client_1.Prisma.NullTypes.JsonNull
                },
                include: {
                    fotos: true
                }
            });
            return res.status(201).json(ocorrencia);
        }
        catch (error) {
            console.error('Erro ao criar ocorrência:', error);
            return res.status(500).json({ error: 'Erro ao criar ocorrência' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const ocorrencia = await prisma.ocorrencia.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    status: data.status,
                    despesas_detalhadas: data.despesas_detalhadas ?
                        data.despesas_detalhadas :
                        client_1.Prisma.NullTypes.JsonNull
                },
                include: {
                    fotos: true
                }
            });
            return res.json(ocorrencia);
        }
        catch (error) {
            console.error('Erro ao atualizar ocorrência:', error);
            return res.status(500).json({ error: 'Erro ao atualizar ocorrência' });
        }
    }
}
exports.OcorrenciaController = OcorrenciaController;
//# sourceMappingURL=ocorrencia.controller.js.map