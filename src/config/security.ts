import { Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export function configureSecurityMiddleware(app: Application): void {
  // Configuração básica do Helmet
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por IP
    message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.'
  });

  // Aplicar rate limiting em todas as rotas
  app.use(limiter);

  // Desabilitar o header X-Powered-By
  app.disable('x-powered-by');
} 