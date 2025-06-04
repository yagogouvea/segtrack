import express, { Request, Response, NextFunction } from 'express';
import { testConnection } from './lib/db';
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

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rotas públicas
app.use('/api/prestadores-publico', prestadoresPublicoRoutes);

// Rotas protegidas
app.use('/api', authenticateToken, sanitizeResponseData(), protectedRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint (versão segura)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Request logging middleware (versão segura)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const sanitizedUrl = req.url.replace(/[<>]/g, '');
  const sanitizedMethod = req.method.replace(/[<>]/g, '');
  console.log(`${new Date().toISOString()} - ${sanitizedMethod} ${sanitizedUrl}`);
  next();
});

// Test database connection on startup
testConnection().catch(error => {
  console.error('Erro ao conectar com o banco de dados:', {
    message: error.message.replace(/[<>]/g, ''),
    timestamp: new Date().toISOString()
  });
});

export default app; 