import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { testConnection, disconnectPrisma } from './infrastructure/database/connection';
import { configureSecurityMiddleware } from './infrastructure/middleware/security';
import { errorHandler } from './infrastructure/middleware/error';
import { requestLogger } from './infrastructure/middleware/logger';
import corsOptions from './infrastructure/config/cors';
import v1Router from './api/v1/routes';

const app = express();

// Configurar trust proxy para Cloud Run
app.set('trust proxy', true);

// Configurações de segurança
configureSecurityMiddleware(app);

// Aplicar CORS antes de qualquer outro middleware
app.use(cors(corsOptions));

// Limite de payload
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Middleware de timeout
const timeout = 30000; // 30 segundos
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(timeout, () => {
    console.error('⚠️ Request timeout:', {
      method: req.method,
      url: req.url,
      timeout: timeout,
      ip: req.ip,
      realIp: req.get('x-real-ip'),
      forwardedFor: req.get('x-forwarded-for')
    });
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Middleware de logging
app.use(requestLogger);

// Rotas da API v1
app.use('/api/v1', v1Router);

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await testConnection();
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Error handling
app.use(errorHandler);

// Gerenciamento de processo
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido sinal SIGTERM, iniciando shutdown graceful...');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido sinal SIGINT, iniciando shutdown graceful...');
  await disconnectPrisma();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Tenta desconectar o banco antes de encerrar
  disconnectPrisma().finally(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', {
    reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// Monitoramento de memória
const MB = 1024 * 1024;
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log('📊 Uso de memória:', {
    rss: `${Math.round(memoryUsage.rss / MB)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / MB)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / MB)}MB`,
    external: `${Math.round(memoryUsage.external / MB)}MB`,
    timestamp: new Date().toISOString()
  });
}, 60000); // Log a cada minuto

export default app; 