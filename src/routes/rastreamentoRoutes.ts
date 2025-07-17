import { Router } from 'express';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';

const router = Router();

// Rota para receber posição do prestador
router.post('/posicao', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem enviar posições.' });
    }

    const { 
      latitude, 
      longitude, 
      velocidade, 
      direcao, 
      altitude, 
      precisao, 
      bateria, 
      sinal_gps, 
      ocorrencia_id,
      observacoes 
    } = req.body;

    // Validações básicas
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude e longitude são obrigatórios' });
    }

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar prestador
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id }
    });

    if (!usuarioPrestador) {
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    // Salvar posição
    const rastreamento = await db.rastreamentoPrestador.create({
      data: {
        prestador_id: usuarioPrestador.prestador_id,
        ocorrencia_id: ocorrencia_id || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        velocidade: velocidade ? parseFloat(velocidade) : null,
        direcao: direcao ? parseFloat(direcao) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        precisao: precisao ? parseFloat(precisao) : null,
        bateria: bateria ? parseInt(bateria) : null,
        sinal_gps: sinal_gps ? parseInt(sinal_gps) : null,
        observacoes: observacoes || null,
        status: 'ativo'
      }
    });

    console.log(`📍 Posição salva para prestador ${usuarioPrestador.prestador_id}: ${latitude}, ${longitude}`);

    res.json({
      message: 'Posição registrada com sucesso',
      rastreamento_id: rastreamento.id,
      timestamp: rastreamento.timestamp
    });

  } catch (error) {
    console.error('❌ Erro ao salvar posição:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter posições de um prestador (para o cliente)
router.get('/prestador/:prestadorId', async (req, res) => {
  try {
    const { prestadorId } = req.params;
    const { inicio, fim, ocorrencia_id } = req.query;

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Construir filtros
    const where: any = {
      prestador_id: parseInt(prestadorId)
    };

    if (ocorrencia_id) {
      where.ocorrencia_id = parseInt(ocorrencia_id as string);
    }

    if (inicio && fim) {
      where.timestamp = {
        gte: new Date(inicio as string),
        lte: new Date(fim as string)
      };
    }

    // Buscar posições
    const posicoes = await db.rastreamentoPrestador.findMany({
      where,
      include: {
        prestador: {
          select: {
            id: true,
            nome: true,
            telefone: true
          }
        },
        ocorrencia: {
          select: {
            id: true,
            placa1: true,
            cliente: true,
            tipo: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limitar a 1000 posições mais recentes
    });

    res.json({
      message: 'Posições do prestador',
      prestador_id: parseInt(prestadorId),
      total_posicoes: posicoes.length,
      posicoes: posicoes
    });

  } catch (error) {
    console.error('❌ Erro ao buscar posições:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter posição atual do prestador
router.get('/prestador/:prestadorId/atual', async (req, res) => {
  try {
    const { prestadorId } = req.params;

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar posição mais recente
    const posicaoAtual = await db.rastreamentoPrestador.findFirst({
      where: {
        prestador_id: parseInt(prestadorId),
        status: 'ativo'
      },
      include: {
        prestador: {
          select: {
            id: true,
            nome: true,
            telefone: true
          }
        },
        ocorrencia: {
          select: {
            id: true,
            placa1: true,
            cliente: true,
            tipo: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (!posicaoAtual) {
      return res.status(404).json({ message: 'Posição atual não encontrada' });
    }

    res.json({
      message: 'Posição atual do prestador',
      posicao: posicaoAtual
    });

  } catch (error) {
    console.error('❌ Erro ao buscar posição atual:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

export default router; 