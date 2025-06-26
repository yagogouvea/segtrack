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
    message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    // Usar X-Forwarded-For como identificador
    keyGenerator: (req) => {
      const xForwardedFor = req.get('x-forwarded-for');
      const realIp = req.get('x-real-ip');
      return xForwardedFor || realIp || req.ip || 'unknown';
    }
  });

  // Rate limiting específico para autenticação
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 tentativas
    message: 'Muitas tentativas de login. Conta temporariamente bloqueada.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const xForwardedFor = req.get('x-forwarded-for');
      const realIp = req.get('x-real-ip');
      return xForwardedFor || realIp || req.ip || 'unknown';
    }
  });

  // Aplicar rate limiting
  app.use(limiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Desabilitar o header X-Powered-By
  app.disable('x-powered-by');
} 