"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaController = void 0;
const prisma_1 = require("../../../lib/prisma");
const ocorrencia_service_1 = require("../../../core/services/ocorrencia.service");
const AppError_1 = require("../../../shared/errors/AppError");
const response_1 = require("../../../utils/response");
const client_1 = require("@prisma/client");
const enums_1 = require("../../../types/enums");
class OcorrenciaController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const { cliente, status, dataInicio, dataFim } = req.query;
                const filters = {
                    cliente: cliente,
                    status: status ? status : undefined,
                    dataInicio: dataInicio ? new Date(dataInicio) : undefined,
                    dataFim: dataFim ? new Date(dataFim) : undefined
                };
                const ocorrencias = await this.service.list(filters);
                res.json(ocorrencias);
            }
            catch (error) {
                console.error('Erro ao listar ocorrências:', error);
                res.status(500).json({ error: 'Erro ao listar ocorrências' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    response_1.sendResponse.badRequest(res, 'ID inválido');
                    return;
                }
                const ocorrencia = await prisma_1.prisma.ocorrencia.findUnique({
                    where: { id },
                    include: { fotos: true }
                });
                if (!ocorrencia) {
                    response_1.sendResponse.notFound(res, 'Ocorrência não encontrada');
                    return;
                }
                response_1.sendResponse.ok(res, ocorrencia);
            }
            catch (error) {
                response_1.sendResponse.error(res, error);
            }
        };
        this.create = async (req, res) => {
            try {
                const ocorrencia = await this.service.create(req.body);
                res.status(201).json(ocorrencia);
            }
            catch (error) {
                console.error('Erro ao criar ocorrência:', error);
                res.status(500).json({ error: 'Erro ao criar ocorrência' });
            }
        };
        this.update = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    response_1.sendResponse.badRequest(res, 'ID inválido');
                    return;
                }
                const data = req.body;
                const ocorrencia = await prisma_1.prisma.ocorrencia.update({
                    where: { id },
                    data: {
                        ...data,
                        status: data.status ?? enums_1.OcorrenciaStatusEnum.em_andamento,
                        despesas_detalhadas: data.despesas_detalhadas ?? client_1.Prisma.JsonNull
                    },
                    include: { fotos: true }
                });
                response_1.sendResponse.ok(res, ocorrencia);
            }
            catch (error) {
                response_1.sendResponse.error(res, error);
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    response_1.sendResponse.badRequest(res, 'ID inválido');
                    return;
                }
                await prisma_1.prisma.ocorrencia.delete({
                    where: { id }
                });
                response_1.sendResponse.noContent(res);
            }
            catch (error) {
                response_1.sendResponse.error(res, error);
            }
        };
        this.addPhotos = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    response_1.sendResponse.badRequest(res, 'ID inválido');
                    return;
                }
                const { urls } = req.body;
                if (!Array.isArray(urls)) {
                    response_1.sendResponse.badRequest(res, 'URLs inválidas');
                    return;
                }
                const ocorrencia = await prisma_1.prisma.ocorrencia.update({
                    where: { id },
                    data: {
                        fotos: {
                            create: urls.map(url => ({
                                url,
                                legenda: ''
                            }))
                        }
                    },
                    include: { fotos: true }
                });
                response_1.sendResponse.ok(res, ocorrencia);
            }
            catch (error) {
                response_1.sendResponse.error(res, error);
            }
        };
        this.generateReport = async (req, res) => {
            try {
                const { id } = req.params;
                const report = await this.service.generateReport(Number(id));
                res.json(report);
            }
            catch (error) {
                if (error instanceof AppError_1.AppError) {
                    res.status(error.statusCode).json({ error: error.message });
                    return;
                }
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        };
        this.service = new ocorrencia_service_1.OcorrenciaService(prisma_1.prisma);
    }
}
exports.OcorrenciaController = OcorrenciaController;
//# sourceMappingURL=ocorrencia.controller.js.map