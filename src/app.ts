import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { testConnection } from './lib/prisma';
import authRoutes from './routes/authRoutes';
import ocorrenciasRouter from './routes/ocorrencias';
import prestadoresRouter from './routes/prestadores';
import clientesRouter from './routes/clientes';
import corsOptions from './infrastructure/config/cors';

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso

// CORS configurado
app.use(cors(corsOptions));

// Middleware personalizado para forçar headers de CORS corretos
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');
  console.log('🔍 Middleware CORS - Origin:', origin);
  
  // Permitir todas as origens temporariamente
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder imediatamente para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS - Respondendo OPTIONS preflight');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(helmet());
app.use(compression());
app.use(express.json());

// Middleware de log para todas as requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

console.log('Configurando rotas básicas...');

// Router global
import { Router } from 'express';
const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
});

// Outras rotas podem ser adicionadas aqui, ex:
// router.use('/ocorrencias', ocorrenciasRoutes);
// router.use('/veiculos', veiculosRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/ocorrencias', ocorrenciasRouter);
app.use('/api/prestadores', prestadoresRouter);
app.use('/api/clientes', clientesRouter);

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

// Middleware fallback 404
app.use((req, res) => {
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