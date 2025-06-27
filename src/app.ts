import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import healthRouter from './routes/health';
import rateLimit from 'express-rate-limit';
import { testConnection } from './lib/prisma';
import authRoutes from './routes/authRoutes';
import ocorrenciasRouter from './routes/ocorrencias';
import prestadoresRouter from './routes/prestadores';
import clientesRouter from './routes/clientes';
import path from 'path';

console.log('[APP] DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'NÃO definida');
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//USER:***@');
  console.log('[APP] DATABASE_URL (parcial):', url);
}

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso

// CORS configurado
const corsOptions = {
  origin: [
    'https://painelsegtrack.com.br', 
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://segtrack-frontend.railway.app',
    'https://segtrack-backend.railway.app',
    /\.railway\.app$/, // Permite qualquer subdomínio do Railway
    /\.vercel\.app$/   // Permite domínios Vercel também
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(compression());
app.use(express.json());

// Adicionado: Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.use('/api', healthRouter);
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