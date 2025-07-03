"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaController = void 0;
const ocorrencia_service_1 = require("../core/services/ocorrencia.service");
const AppError_1 = require("../shared/errors/AppError");
class OcorrenciaController {
    constructor() {
        this.service = new ocorrencia_service_1.OcorrenciaService();
    }
    async list(req, res) {
        try {
            console.log('[OcorrenciaController] Iniciando listagem de ocorrências');
            console.log('[OcorrenciaController] Query params:', req.query);
            console.log('[OcorrenciaController] User:', req.user);
            const { id, status, placa, cliente, prestador, inicio, fim } = req.query;
            const filters = {
                id: id ? Number(id) : undefined,
                status: status,
                placa: placa,
                cliente: cliente,
                prestador: prestador,
                data_inicio: inicio ? new Date(inicio) : undefined,
                data_fim: fim ? new Date(fim) : undefined
            };
            console.log('[OcorrenciaController] Filtros aplicados:', filters);
            const ocorrencias = await this.service.list(filters);
            console.log('[OcorrenciaController] Ocorrências encontradas:', ocorrencias.length);
            return res.json(ocorrencias);
        }
        catch (error) {
            console.error('[OcorrenciaController] Erro ao listar ocorrências:', {
                error,
                message: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined
            });
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    async create(req, res) {
        try {
            console.log('🔍 Controller - Dados recebidos:', req.body);
            const operador = req.body.operador;
            const ocorrencia = await this.service.create(req.body);
            return res.status(201).json(ocorrencia);
        }
        catch (error) {
            console.error('❌ Erro no controller de ocorrência:', error);
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
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
                return res.status(error.statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async update(req, res) {
        try {
            console.log('[OcorrenciaController] Iniciando atualização de ocorrência');
            console.log('[OcorrenciaController] ID:', req.params.id);
            console.log('[OcorrenciaController] Body recebido:', JSON.stringify(req.body, null, 2));
            console.log('[OcorrenciaController] Headers:', req.headers);
            console.log('[OcorrenciaController] Content-Type:', req.headers['content-type']);
            console.log('[OcorrenciaController] User:', req.user);
            const { id } = req.params;
            const operador = req.body.operador;
            // Validar dados obrigatórios
            if (!req.body.placa1 || !req.body.cliente || !req.body.tipo) {
                console.log('[OcorrenciaController] Dados obrigatórios faltando:', {
                    placa1: req.body.placa1,
                    cliente: req.body.cliente,
                    tipo: req.body.tipo
                });
                return res.status(400).json({
                    error: 'Campos obrigatórios faltando: placa1, cliente, tipo',
                    received: {
                        placa1: req.body.placa1,
                        cliente: req.body.cliente,
                        tipo: req.body.tipo
                    }
                });
            }
            const ocorrencia = await this.service.update(Number(id), req.body);
            console.log('[OcorrenciaController] Ocorrência atualizada com sucesso:', ocorrencia.id);
            return res.json(ocorrencia);
        }
        catch (error) {
            console.error('[OcorrenciaController] Erro ao atualizar ocorrência:', {
                error,
                message: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined
            });
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
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
                return res.status(error.statusCode).json({ error: error.message });
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
                return res.status(error.statusCode).json({ error: error.message });
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
                return res.status(error.statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async addFotos(req, res) {
        try {
            const { id } = req.params;
            const files = req.files;
            if (!files || files.length === 0) {
                throw new AppError_1.AppError('Nenhuma foto foi enviada', 400);
            }
            // Log do caminho dos arquivos salvos
            files.forEach(file => console.log('Arquivo salvo (ocorrencia.controller.ts):', file.path));
            const urls = files.map(file => file.path);
            const ocorrencia = await this.service.addFotos(Number(id), urls);
            return res.json(ocorrencia);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async findResultado(req, res) {
        try {
            const { id } = req.params;
            const ocorrencia = await this.service.findById(Number(id));
            if (!ocorrencia) {
                return res.status(404).json({ error: 'Ocorrência não encontrada' });
            }
            return res.json({
                resultado: ocorrencia.resultado,
                status: ocorrencia.status
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.OcorrenciaController = OcorrenciaController;
