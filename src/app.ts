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
import clientesRouter from './routes/clientes';
import userRoutes from './routes/userRoutes';
import cnpjRouter from './routes/cnpj';
import veiculosRouter from './routes/veiculos';
import fotosRouter from './routes/fotos';

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso

const allowedOrigins = ['https://segtrack-frontend-production-fe95.up.railway.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

app.use(helmet());
app.use(compression());
app.use(express.json());

// Configuração para servir arquivos estáticos da pasta uploads
app.use('/api/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://segtrack-frontend-production-fe95.up.railway.app');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Global OPTIONS handler for preflight requests
app.options('*', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', 'https://segtrack-frontend-production-fe95.up.railway.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Middleware de log para todas as requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

console.log('Configurando rotas básicas...');

// Outras rotas podem ser adicionadas aqui, ex:
// router.use('/ocorrencias', ocorrenciasRoutes);
// router.use('/veiculos', veiculosRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/ocorrencias', ocorrenciasRouter);
app.use('/api/prestadores', prestadoresRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/users', userRoutes);
app.use('/api/cnpj', cnpjRouter);
app.use('/api/veiculos', veiculosRouter);
app.use('/api/fotos', fotosRouter);

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