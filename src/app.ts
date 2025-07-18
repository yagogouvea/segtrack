import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { testConnection } from './lib/prisma';
import authRoutes from './routes/authRoutes';
import ocorrenciasRouter from './routes/ocorrencias';
import prestadoresRouter from './routes/prestadores';
import prestadoresPublicoRouter from './routes/prestadoresPublico';
import clientesRouter from './routes/clientes';
import userRoutes from './routes/userRoutes';
import cnpjRouter from './routes/cnpj';
import prestadorRoutes from './routes/prestador.js';
// import veiculosRouter from './routes/veiculos';
import fotosRouter from './routes/fotos';
import v1Router from './api/v1/routes';
import protectedRoutes from './routes/protectedRoutes';
import prestadorProtectedRoutes from './routes/prestadorProtectedRoutes';
import rastreamentoRoutes from './routes/rastreamentoRoutes';
import { authenticateToken } from './infrastructure/middleware/auth.middleware';
import fs from 'fs';

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso

// CORS - deve vir antes de qualquer rota
const allowedOrigins = [
  'https://app.painelsegtrack.com.br',
  'https://cliente.painelsegtrack.com.br',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:8080',
  'https://prestador.painelsegtrack.com.br', // front antigo
  'https://prestadores.painelsegtrack.com.br', // novo domínio
  'https://painel-prestador.painelsegtrack.com.br', // domínio específico do painel
  'https://prestador.painelsegtrack.com.br' // domínio alternativo
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

app.use(helmet());
app.use(compression());
app.use(express.json());

// Configuração para servir arquivos estáticos da pasta uploads
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: 0,
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Middleware de log para todas as requisições (ANTES das rotas do frontend)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  console.log(`🔍 Headers:`, req.headers);
  console.log(`🔍 Query:`, req.query);
  console.log(`🔍 Params:`, req.params);
  next();
});

// Servir arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, '../../cliente-segtrack/build')));

// Todas as rotas que não começam com /api devem servir o index.html do React
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../cliente-segtrack/build', 'index.html'));
});

console.log('Configurando rotas básicas...');

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('[app] Rota de teste acessada');
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Rota de teste para ocorrências sem autenticação
app.get('/api/ocorrencias-test', (req, res) => {
  console.log('[app] Rota de teste de ocorrências acessada');
  res.json({ message: 'Rota de ocorrências funcionando!', timestamp: new Date().toISOString() });
});

// Rota de teste para fotos sem autenticação
app.get('/api/fotos-test', (req, res) => {
  console.log('[app] Rota de teste de fotos acessada');
  res.json({ message: 'Rota de fotos funcionando!', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/ocorrencias', ocorrenciasRouter);

// Rota pública para resumo de prestadores (usado no formulário de ocorrências)
app.get('/api/prestadores/resumo', async (req, res) => {
  try {
    const { ensurePrisma } = await import('./lib/prisma');
    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    const prestadores = await db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true
      },
      where: {
        aprovado: true // Apenas prestadores aprovados
      },
      orderBy: {
        nome: 'asc'
      }
    });

    res.json(prestadores);
  } catch (error) {
    console.error('Erro ao buscar prestadores resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar prestadores' });
  }
});

// Rota pública para buscar ocorrências de prestadores (similar à rota de clientes)
app.get('/api/prestador/ocorrencias/:prestadorId', async (req, res) => {
  try {
    const { prestadorId } = req.params;
    console.log(`[app] Buscando ocorrências para prestador: ${prestadorId}`);
    
    const { ensurePrisma } = await import('./lib/prisma');
    const db = await ensurePrisma();
    
    if (!db) {
      console.error('[app] Erro: Instância do Prisma não disponível');
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
      console.log(`[app] Prestador não encontrado: ${prestadorId}`);
      return res.status(404).json({ error: 'Prestador não encontrado' });
    }

    console.log(`[app] Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);

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

    console.log(`[app] Ocorrências encontradas: ${ocorrencias.length}`);

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
    console.error('[app] Erro ao buscar ocorrências do prestador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.use('/api/prestadores', authenticateToken, prestadoresRouter);
app.use('/api/prestadores-publico', prestadoresPublicoRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/users', userRoutes);
app.use('/api/cnpj', cnpjRouter);
app.use('/api/prestador', prestadorRoutes);
// Removida rota de veículos - não é mais necessária
// app.use('/api/veiculos', veiculosRouter);
app.use('/api/fotos', fotosRouter);

// Adicionar rotas da API v1
app.use('/api/v1', v1Router);



// Adicionar rotas protegidas para clientes
app.use('/api/protected', protectedRoutes);

// Adicionar rotas protegidas para prestadores
app.use('/api/protected-prestador', prestadorProtectedRoutes);

// Adicionar rotas de rastreamento
app.use('/api/rastreamento', rastreamentoRoutes);

// Rota de teste temporária para debug (movida para antes do router)
app.get('/api/protected-prestador/test', (req, res) => {
  console.log('[app] Rota de teste protegida-prestador acessada');
  res.json({ message: 'Rota protegida-prestador funcionando!', timestamp: new Date().toISOString() });
});



// Rota básica para /api
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API Segtrack online!' });
});

// Rota básica para teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Segtrack - Funcionando!' });
});

// Adicionar express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Manter apenas a rota direta /api/health
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Erro no health check:', err);
    res.status(500).json({ status: 'erro', detalhes: (err instanceof Error ? err.message : String(err)) });
  }
});

// Endpoint temporário para debug do caminho da pasta uploads
app.get('/api/debug/uploads-path', (req, res) => {
  res.json({ uploadsPath: path.join(__dirname, '../uploads') });
});

// Endpoint temporário para listar arquivos da pasta uploads
app.get('/api/debug/list-uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, '../uploads');
  fs.readdir(uploadsPath, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ files });
  });
});

// Middleware fallback 404 (apenas para rotas de API)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

console.log('Configuração do Express concluída!');

export default app; 