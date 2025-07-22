import { Router } from 'express';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';

const router = Router();

// Rota para salvar posição do prestador
router.post('/rastreamento', authenticateToken, async (req, res) => {
  try {
    console.log('📍 Salvando posição do prestador...');
    
    const user = req.user;
    if (!user) {
      console.log('❌ Prestador não autenticado');
      return res.status(401).json({ message: 'Prestador não autenticado' });
    }

    if (user.tipo !== 'prestador') {
      console.log('❌ Usuário não é prestador');
      return res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
    }

    const {
      prestador_id,
      ocorrencia_id,
      latitude,
      longitude,
      velocidade,
      direcao,
      altitude,
      precisao,
      bateria,
      sinal_gps,
      observacoes,
      status = 'ativo'
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude e longitude são obrigatórios' });
    }

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Salvar posição na tabela RastreamentoPrestador
    const rastreamento = await db.rastreamentoPrestador.create({
      data: {
        prestador_id: prestador_id || (user as any).prestador_id,
        ocorrencia_id: ocorrencia_id || null,
        latitude,
        longitude,
        velocidade: velocidade || null,
        direcao: direcao || null,
        altitude: altitude || null,
        precisao: precisao || null,
        bateria: bateria || null,
        sinal_gps: sinal_gps || null,
        observacoes: observacoes || null,
        status
      }
    });

    console.log('✅ Posição salva com sucesso:', {
      id: rastreamento.id,
      prestador_id: rastreamento.prestador_id,
      latitude: rastreamento.latitude,
      longitude: rastreamento.longitude,
      timestamp: rastreamento.timestamp
    });

    res.json({
      message: 'Posição salva com sucesso',
      rastreamento: {
        id: rastreamento.id,
        latitude: rastreamento.latitude,
        longitude: rastreamento.longitude,
        timestamp: rastreamento.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar posição:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para buscar rastreamento de uma ocorrência
router.get('/rastreamento/:ocorrenciaId', authenticateToken, async (req, res) => {
  try {
    const { ocorrenciaId } = req.params;
    
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    const rastreamentos = await db.rastreamentoPrestador.findMany({
      where: {
        ocorrencia_id: parseInt(ocorrenciaId),
        prestador_id: (user as any).prestador_id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limitar a 100 posições mais recentes
    });

    res.json({
      message: 'Rastreamento encontrado',
      rastreamentos,
      total: rastreamentos.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar rastreamento:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter posições em tempo real (para o painel do cliente)
router.get('/rastreamento-tempo-real/:ocorrenciaId', async (req, res) => {
  try {
    const { ocorrenciaId } = req.params;
    
    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar posições dos últimos 5 minutos
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
    
    const posicoes = await db.rastreamentoPrestador.findMany({
      where: {
        ocorrencia_id: parseInt(ocorrenciaId),
        timestamp: {
          gte: cincoMinutosAtras
        },
        status: 'ativo'
      },
      include: {
        prestador: {
          select: {
            id: true,
            nome: true,
            telefone: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Últimas 50 posições
    });

    // Buscar ocorrência para informações adicionais
    const ocorrencia = await db.ocorrencia.findUnique({
      where: { id: parseInt(ocorrenciaId) },
      select: {
        id: true,
        placa1: true,
        cliente: true,
        tipo: true,
        status: true
      }
    });

    res.json({
      message: 'Posições em tempo real',
      ocorrencia: ocorrencia,
      posicoes: posicoes,
      total_posicoes: posicoes.length,
      ultima_atualizacao: new Date().toISOString(),
      tempo_real: true
    });

  } catch (error) {
    console.error('❌ Erro ao buscar posições em tempo real:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter posição atual do prestador
router.get('/posicao-atual/:prestadorId', async (req, res) => {
  try {
    const { prestadorId } = req.params;
    
    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar posição mais recente do prestador
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