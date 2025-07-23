"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaController = void 0;
const ocorrencia_service_1 = require("../../../core/services/ocorrencia.service");
const AppError_1 = require("../../../shared/errors/AppError");
class OcorrenciaController {
    constructor() {
        this.service = new ocorrencia_service_1.OcorrenciaService();
    }
    async list(req, res) {
        try {
            const { status, placa, cliente, data_inicio, data_fim } = req.query;
            const filters = {
                status: status,
                placa: placa,
                cliente: cliente,
                data_inicio: data_inicio ? new Date(data_inicio) : undefined,
                data_fim: data_fim ? new Date(data_fim) : undefined
            };
            const ocorrencias = await this.service.list(filters);
            return res.json(ocorrencias);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async create(req, res) {
        try {
            const ocorrencia = await this.service.create(req.body);
            return res.status(201).json(ocorrencia);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const ocorrencia = await this.service.findById(Number(id));
            return res.json(ocorrencia);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            console.log('[OcorrenciaController] Update request for ID:', id);
            console.log('[OcorrenciaController] Request body:', JSON.stringify(req.body, null, 2));
            const ocorrencia = await this.service.update(Number(id), req.body);
            return res.json(ocorrencia);
        }
        catch (error) {
            console.error('[OcorrenciaController] Error in update:', error);
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.service.delete(Number(id));
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async findByStatus(req, res) {
        try {
            const { status } = req.params;
            const ocorrencias = await this.service.findByStatus(status);
            return res.json(ocorrencias);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async findByPlaca(req, res) {
        try {
            const { placa } = req.params;
            const ocorrencias = await this.service.findByPlaca(placa);
            return res.json(ocorrencias);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async addFotos(req, res) {
        try {
            const { id } = req.params;
            const { urls } = req.body;
            if (!Array.isArray(urls)) {
                return res.status(400).json({ error: 'URLs devem ser um array' });
            }
            const ocorrencia = await this.service.addFotos(Number(id), urls);
            return res.json(ocorrencia);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.OcorrenciaController = OcorrenciaController;
