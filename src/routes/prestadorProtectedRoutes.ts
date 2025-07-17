import { Router } from 'express';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';

const router = Router();

// Rota para obter ocorrências do prestador autenticado
router.get('/prestador/ocorrencias', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Iniciando busca de ocorrências do prestador...');
    
    const user = req.user;
    if (!user) {
      console.log('❌ Prestador não autenticado');
      return res.status(401).json({ message: 'Prestador não autenticado' });
    }

    console.log('👤 Prestador autenticado:', {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo
    });

    if (user.tipo !== 'prestador') {
      console.log('❌ Usuário não é prestador');
      return res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
    }

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar prestador no banco para validar
    // Primeiro buscar o UsuarioPrestador para obter o prestador_id
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id }
    });

    if (!usuarioPrestador) {
      console.log(`❌ Usuário prestador não encontrado: ${user.id}`);
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    // Agora buscar o prestador usando o prestador_id
    const prestador = await db.prestador.findUnique({
      where: { id: usuarioPrestador.prestador_id }
    });

    if (!prestador) {
      console.log(`❌ Prestador não encontrado no banco: ${user.nome}`);
      return res.status(404).json({ message: 'Prestador não encontrado' });
    }

    console.log(`✅ Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);

    // Buscar ocorrências vinculadas ao prestador usando busca flexível
    // Primeiro, tentar busca exata pelo nome
    let ocorrencias = await db.ocorrencia.findMany({
      where: {
        prestador: prestador.nome,
        status: {
          in: ['em_andamento', 'aguardando']
        }
      },
      include: {
        fotos: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });

    // Se não encontrar ocorrências com nome exato, tentar busca por similaridade
    if (ocorrencias.length === 0) {
      console.log(`🔍 Nenhuma ocorrência encontrada com nome exato "${prestador.nome}", tentando busca por similaridade...`);
      
      // Buscar ocorrências que contenham o nome do prestador
      ocorrencias = await db.ocorrencia.findMany({
        where: {
          AND: [
            {
              OR: [
                { prestador: { contains: prestador.nome } },
                { prestador: { contains: prestador.nome.split(' ')[0] } }, // Primeiro nome
                { prestador: { contains: prestador.nome.split(' ').slice(-1)[0] } } // Último nome
              ]
            },
            {
              status: {
                in: ['em_andamento', 'aguardando']
              }
            }
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

    // Se ainda não encontrar, buscar por todas as ocorrências ativas para debug
    if (ocorrencias.length === 0) {
      console.log(`🔍 Nenhuma ocorrência encontrada com busca flexível, buscando todas as ocorrências ativas para debug...`);
      
      const todasOcorrencias = await db.ocorrencia.findMany({
        where: {
          status: {
            in: ['em_andamento', 'aguardando']
          }
        },
        select: {
          id: true,
          prestador: true,
          status: true,
          tipo: true,
          criado_em: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
      
      console.log(`📋 Ocorrências ativas no sistema:`, todasOcorrencias.map((o: any) => ({
        id: o.id,
        prestador: o.prestador,
        status: o.status,
        tipo: o.tipo
      })));
    }

    console.log(`✅ Ocorrências encontradas para o prestador: ${ocorrencias.length}`);

    res.json({
      message: 'Lista de ocorrências do prestador',
      prestador: {
        id: prestador.id,
        nome: prestador.nome,
        email: prestador.email
      },
      ocorrencias: ocorrencias,
      total: ocorrencias.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter ocorrências do prestador:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      user: req.user
    });
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

export default router; 