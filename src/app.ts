import express, { Request, Response, NextFunction } from 'express';
import { testConnection, disconnectPrisma } from './lib/db';
import { authenticateToken } from './middleware/authMiddleware';
import { configureSecurityMiddleware } from './config/security';
import { sanitizeResponseData } from './middleware/dataSanitizer';
import cors from 'cors';
import corsOptions from './config/cors.config';

// Importando rotas
import prestadoresPublicoRoutes from './routes/prestadoresPublico';
import protectedRoutes from './routes/protectedRoutes';

const app = express();

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
      timeout: timeout
    });
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Middleware de logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const sanitizedUrl = req.url.replace(/[<>]/g, '');
  const sanitizedMethod = req.method.replace(/[<>]/g, '');
  
  console.log(`[${new Date().toISOString()}] 📥 Recebendo ${sanitizedMethod} ${sanitizedUrl}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ✅ Completado ${sanitizedMethod} ${sanitizedUrl} em ${duration}ms`);
  });
  
  next();
});

// Rotas públicas
app.use('/api/prestadores-publico', prestadoresPublicoRoutes);

// Rotas protegidas
app.use('/api', authenticateToken, sanitizeResponseData(), protectedRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro não tratado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await testConnection();
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

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