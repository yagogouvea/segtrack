import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { testConnection } from './lib/prisma';
import healthRoutes from './routes/health';

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', false); // Desabilita trust proxy para evitar bypass de IP

// Configuração do CORS
const allowedOrigins = [
  'https://painelsegtrack.com.br',
  'https://www.painelsegtrack.com.br',
  'https://api.painelsegtrack.com.br'
];

// Middleware CORS com log detalhado
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como mobile apps ou ferramentas de API)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cache preflight por 24 horas
}));

// Outros middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());

// Middleware de log para todas as requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

console.log('Configurando rotas básicas...');

// Rota básica para teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Segtrack - Funcionando!' });
});

// Health check endpoint
app.use('/api/health', healthRoutes);

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