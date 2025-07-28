import { Router } from 'express';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '@/controllers/ocorrencia.controller';
import { validateCreateOcorrencia } from '@/api/v1/validators/ocorrencia.validator';
import multer from 'multer';
import { upload } from '../config/upload';

const router = Router();
const controller = new OcorrenciaController();

// Rota de teste sem autenticação
router.get('/test', (req, res) => {
  console.log('[ocorrencias] Rota de teste acessada');
  res.json({ message: 'Rota de teste funcionando!' });
});

// Rota para buscar ocorrências finalizadas (fechamentos) - SEM AUTENTICAÇÃO TEMPORARIAMENTE
router.get('/fechamentos', async (req, res) => {
  try {
    console.log('[ocorrencias] Buscando ocorrências finalizadas...');
    
    const { ensurePrisma } = await import('../lib/prisma');
    const db = await ensurePrisma();
    
    if (!db) {
      console.error('[ocorrencias] Erro: Instância do Prisma não disponível');
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    // Buscar ocorrências finalizadas e em andamento com resultado
    const ocorrencias = await db.ocorrencia.findMany({
      where: {
        OR: [
          { status: 'concluida' },
          { 
            status: 'em_andamento',
            resultado: {
              not: null
            }
          }
        ],
        resultado: {
          not: 'cancelado'
        }
      },
      select: {
        id: true,
        cliente: true,
        operador: true,
        criado_em: true,
        placa1: true,
        modelo1: true,
        cor1: true,
        tipo: true,
        coordenadas: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        prestador: true,
        inicio: true,
        chegada: true,
        termino: true,
        km_inicial: true,
        km_final: true,
        resultado: true,
        status: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });

    console.log(`[ocorrencias] Ocorrências finalizadas encontradas: ${ocorrencias.length}`);

    res.json(ocorrencias);
  } catch (error) {
    console.error('[ocorrencias] Erro ao buscar ocorrências finalizadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.use(authenticateToken);

// Rota de teste com autenticação
router.get('/test-auth', (req, res) => {
  console.log('[ocorrencias] Rota de teste com auth acessada');
  res.json({ message: 'Rota de teste com auth funcionando!', user: req.user });
});

// Rota de teste para listagem sem permissões
router.get('/test-list', (req, res) => {
  console.log('[ocorrencias] Rota de teste de listagem acessada');
  console.log('[ocorrencias] User:', req.user);
  console.log('[ocorrencias] Headers:', req.headers);
  
  // Simular retorno de ocorrências vazias para teste
  res.json([]);
});

// Rota de teste para verificar conexão com banco
router.get('/test-db', async (req, res) => {
  try {
    console.log('[ocorrencias] Testando conexão com banco...');
    console.log('[ocorrencias] DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
    
    const { ensurePrisma } = await import('@/lib/prisma');
    const db = await ensurePrisma();
    
    console.log('[ocorrencias] Prisma disponível:', !!db);
    
    // Testar query simples
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log('[ocorrencias] Query de teste:', result);
    
    res.json({ 
      message: 'Conexão com banco OK',
      databaseUrl: process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
      prismaAvailable: !!db,
      testQuery: result
    });
  } catch (error) {
    console.error('[ocorrencias] Erro no teste de banco:', error);
    res.status(500).json({ 
      error: 'Erro na conexão com banco',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Rota para verificar configurações do ambiente
router.get('/test-env', (req, res) => {
  console.log('[ocorrencias] Verificando configurações do ambiente...');
  
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
    JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA',
    PORT: process.env.PORT,
    HOST: process.env.HOST
  };
  
  console.log('[ocorrencias] Variáveis de ambiente:', envVars);
  
  res.json({
    message: 'Configurações do ambiente',
    environment: envVars,
    timestamp: new Date().toISOString()
  });
});

// Listagem e busca
router.get('/', (req, res) => {
  console.log('[ocorrencias] GET / - Iniciando listagem');
  console.log('[ocorrencias] User:', req.user);
  console.log('[ocorrencias] Headers:', req.headers);
  
  // Chamar o controller
  controller.list(req, res);
});

// Rota específica para buscar ocorrências por prestador (DEVE VIR ANTES de /:id)
router.get('/prestador/:prestadorId', authenticateToken, async (req, res) => {
  try {
    const { prestadorId } = req.params;
    console.log(`[ocorrencias] Buscando ocorrências para prestador: ${prestadorId}`);
    console.log(`[ocorrencias] Usuário autenticado:`, req.user);
    
    const { ensurePrisma } = await import('../lib/prisma');
    const db = await ensurePrisma();
    
    if (!db) {
      console.error('[ocorrencias] Erro: Instância do Prisma não disponível');
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    // Buscar prestador primeiro para validar
    const prestador = await db.prestador.findFirst({
      where: { 
        OR: [
          { id: Number(prestadorId) },
          { nome: prestadorId }
        ]
      }
    });

    if (!prestador) {
      console.log(`[ocorrencias] Prestador não encontrado: ${prestadorId}`);
      return res.status(404).json({ error: 'Prestador não encontrado' });
    }

    console.log(`[ocorrencias] Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);

    // Buscar ocorrências vinculadas ao prestador
    const ocorrencias = await db.ocorrencia.findMany({
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

    console.log(`[ocorrencias] Ocorrências encontradas: ${ocorrencias.length}`);

    res.json({
      prestador: {
        id: prestador.id,
        nome: prestador.nome,
        email: prestador.email
      },
      ocorrencias: ocorrencias,
      total: ocorrencias.length
    });
  } catch (error) {
    console.error('[ocorrencias] Erro ao buscar ocorrências do prestador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas específicas (DEVEM VIR ANTES de /:id)
router.get('/status/:status', (req, res) => controller.findByStatus(req, res));
router.get('/placa/:placa', (req, res) => controller.findByPlaca(req, res));

// Rota para buscar resultado de uma ocorrência
router.get('/:id/resultado', (req, res) => controller.findResultado(req, res));

// Upload de fotos
router.post('/:id/fotos', requirePermission('upload:foto'), upload.array('fotos'), (req, res) => controller.addFotos(req, res));

// Rota genérica para buscar por ID (DEVE VIR DEPOIS das rotas específicas)
router.get('/:id', (req, res) => controller.findById(req, res));

// Criação e atualização
router.post('/', requirePermission('create:ocorrencia'), validateCreateOcorrencia, (req: any, res: any) => controller.create(req, res));

// ROTA TEMPORÁRIA PARA TESTE - SEM PERMISSÃO
router.put('/:id/test', (req, res) => {
  console.log('[ocorrencias] Rota de teste PUT acessada');
  console.log('[ocorrencias] ID:', req.params.id);
  console.log('[ocorrencias] Body:', req.body);
  console.log('[ocorrencias] User:', req.user);
  
  // Simular resposta de sucesso
  res.json({ 
    message: 'Rota de teste PUT funcionando!',
    id: req.params.id,
    body: req.body,
    user: req.user
  });
});

// Rota PUT original com permissão (TEMPORARIAMENTE SEM PERMISSÃO PARA TESTE)
router.put('/:id', (req, res) => controller.update(req, res));
// router.put('/:id', requirePermission('update:ocorrencia'), (req, res) => controller.update(req, res));
router.delete('/:id', requirePermission('delete:ocorrencia'), (req, res) => controller.delete(req, res));

export default router;
