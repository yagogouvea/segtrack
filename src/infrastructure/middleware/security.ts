import { Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export function configureSecurityMiddleware(app: Express): void {
  // Helmet para headers de segurança
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false
  });

  app.use(limiter);

  // Desabilitar X-Powered-By
  app.disable('x-powered-by');

  // Configurações adicionais de segurança
  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.frameguard({ action: 'deny' }));
} 