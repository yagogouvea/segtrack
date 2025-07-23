"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const prisma_1 = require("../../../lib/prisma");
const router = (0, express_1.Router)();
// POST /api/v1/monitoramento/posicao
// Recebe posição do prestador em tempo real
router.post('/posicao', auth_middleware_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const { prestadorId, ocorrenciaId, latitude, longitude, timestamp } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub; // Usando sub em vez de id
        // Validar dados obrigatórios
        if (!prestadorId || !ocorrenciaId || !latitude || !longitude || !timestamp) {
            return res.status(400).json({
                error: 'Dados obrigatórios: prestadorId, ocorrenciaId, latitude, longitude, timestamp'
            });
        }
        // Validar formato das coordenadas
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({
                error: 'latitude e longitude devem ser números'
            });
        }
        // Validar range das coordenadas
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: 'Coordenadas inválidas'
            });
        }
        const db = await (0, prisma_1.ensurePrisma)();
        // Verificar se o prestador existe
        const prestador = await db.prestador.findUnique({
            where: { id: Number(prestadorId) }
        });
        if (!prestador) {
            return res.status(404).json({ error: 'Prestador não encontrado' });
        }
        // Verificar se a ocorrência existe
        const ocorrencia = await db.ocorrencia.findUnique({
            where: { id: Number(ocorrenciaId) }
        });
        if (!ocorrencia) {
            return res.status(404).json({ error: 'Ocorrência não encontrada' });
        }
        // Salvar posição no banco (opcional - para histórico)
        // Aqui você pode implementar uma tabela de posições se necessário
        console.log(`📍 Posição recebida - Prestador: ${prestadorId}, Ocorrência: ${ocorrenciaId}, Lat: ${latitude}, Lon: ${longitude}`);
        // Retornar sucesso
        res.status(200).json({
            success: true,
            message: 'Posição registrada com sucesso',
            data: {
                prestadorId,
                ocorrenciaId,
                latitude,
                longitude,
                timestamp
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao registrar posição:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao registrar posição'
        });
    }
});
exports.default = router;
