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
  'https://www.segtrackprontaresposta.com.br'
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como mobile apps ou ferramentas de API)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`Origem bloqueada pelo CORS: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Outros middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());

console.log('Configurando rotas básicas...');

// Rota básica para teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Segtrack - Funcionando!' });
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await testConnection();
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
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