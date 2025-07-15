import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../../../lib/prisma';

const router = Router();

// POST /api/v1/monitoramento/posicao
// Recebe posição do prestador em tempo real
router.post('/posicao', authenticateToken, async (req, res) => {
  try {
    const { prestadorId, ocorrenciaId, latitude, longitude, timestamp } = req.body;
    const userId = req.user?.sub; // Usando sub em vez de id

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

    const db = await ensurePrisma();

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

  } catch (error: unknown) {
    console.error('❌ Erro ao registrar posição:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao registrar posição' 
    });
  }
});

export default router; 