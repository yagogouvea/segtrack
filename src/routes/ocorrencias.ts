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
router.get('/:id', (req, res) => controller.findById(req, res));

// Criação e atualização
router.post('/', requirePermission('create:ocorrencia'), validateCreateOcorrencia, (req: any, res: any) => controller.create(req, res));
router.put('/:id', requirePermission('update:ocorrencia'), (req, res) => controller.update(req, res));
router.delete('/:id', requirePermission('delete:ocorrencia'), (req, res) => controller.delete(req, res));

// Rotas específicas
router.get('/status/:status', (req, res) => controller.findByStatus(req, res));
router.get('/placa/:placa', (req, res) => controller.findByPlaca(req, res));

// Rota para buscar resultado de uma ocorrência
router.get('/:id/resultado', (req, res) => controller.findResultado(req, res));

// Upload de fotos
router.post('/:id/fotos', requirePermission('upload:foto'), upload.array('fotos'), (req, res) => controller.addFotos(req, res));

export default router;
