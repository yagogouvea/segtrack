import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { testConnection } from './lib/db';
import { authenticateToken, AuthRequest } from './middleware/authMiddleware';
import { corsMiddleware } from './middleware/cors';
import { configureSecurityMiddleware } from './config/security';
import { sanitizeResponseData } from './middleware/dataSanitizer';

// Importando rotas
import prestadoresPublicoRoutes from './routes/prestadoresPublico';
import protectedRoutes from './routes/protectedRoutes';

const app = express();

// Configurações de segurança
configureSecurityMiddleware(app);

// CORS configuration
app.use(corsMiddleware);

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Aplicar sanitização de dados para todas as respostas
app.use(sanitizeResponseData());

// Rotas públicas (com dados limitados)
app.use('/api/prestadores/publico', prestadoresPublicoRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/protected', authenticateToken, protectedRoutes);

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

// Global error handler (versão segura)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro:', {
    name: err.name,
    message: err.message.replace(/[<>]/g, ''),
    timestamp: new Date().toISOString()
  });
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => ({
        message: e.message.replace(/[<>]/g, ''),
        path: e.path
      }))
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message.replace(/[<>]/g, '')
      : undefined
  });
});

// Test database connection on startup
testConnection().catch(error => {
  console.error('Erro ao conectar com o banco de dados:', {
    message: error.message.replace(/[<>]/g, ''),
    timestamp: new Date().toISOString()
  });
});

export default app; 