import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { testConnection, disconnectPrisma } from './lib/prisma';
import { configureSecurityMiddleware } from './infrastructure/middleware/security';
import { requestLogger } from './infrastructure/middleware/logger';
import corsOptions from './infrastructure/config/cors';
import v1Router from './api/v1/routes';
import logger from './infrastructure/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();

// Configurar trust proxy para Cloud Run/Load Balancer
app.set('trust proxy', true);

// Configurações de segurança básicas
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Configurações de segurança adicionais
configureSecurityMiddleware(app);

// CORS configurado
app.use(cors(corsOptions));

// Limite de payload
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Middleware de timeout
const timeout = 30000; // 30 segundos
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(timeout, () => {
    logger.error('Request timeout:', {
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

// Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API v1
app.use('/api/v1', v1Router);

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await testConnection();
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gerenciamento de processo
process.on('SIGTERM', async () => {
  logger.info('Recebido sinal SIGTERM, iniciando shutdown graceful...');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Recebido sinal SIGINT, iniciando shutdown graceful...');
  await disconnectPrisma();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.fatal('Erro não capturado:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  disconnectPrisma().finally(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promise rejeitada não tratada:', {
    reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// Monitoramento de memória
const MB = 1024 * 1024;
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  logger.info('Uso de memória:', {
    rss: `${Math.round(memoryUsage.rss / MB)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / MB)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / MB)}MB`,
    external: `${Math.round(memoryUsage.external / MB)}MB`
  });
}, 60000); // Log a cada minuto

export default app; 