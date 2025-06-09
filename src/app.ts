import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { testConnection } from './lib/prisma';

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', false); // Desabilita trust proxy para evitar bypass de IP

// Configuração do CORS
const allowedOrigins = [
  'http://segtrackprontaresposta.com.br',
  'https://segtrackprontaresposta.com.br',
  'http://www.segtrackprontaresposta.com.br',
  'https://www.segtrackprontaresposta.com.br',
  'http://localhost:3000',
  'http://localhost:5173'
];

// Middleware CORS com log detalhado
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como mobile apps ou ferramentas de API)
    if (!origin) {
      console.log('Requisição sem origin permitida');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`Origin permitida: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`Origin bloqueada: ${origin}`);
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
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await testConnection();
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    };
    console.log('Health check bem sucedido:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Health check falhou:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: String(error),
      timestamp: new Date().toISOString()
    });
  }
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