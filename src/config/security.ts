import helmet from 'helmet';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';

export const configureSecurityMiddleware = (app: Express) => {
  // Configuração do Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "same-site" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true,
    })
  );

  // Rate limiting global
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: {
      error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
      retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting específico para autenticação
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 tentativas
    message: {
      error: 'Muitas tentativas de login. Conta temporariamente bloqueada.',
      retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Aplicar rate limiting
  app.use(limiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Middleware para sanitização de dados
  app.use((req, res, next) => {
    if (req.body) {
      // Remover caracteres potencialmente perigosos
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key]
            .replace(/[<>]/g, '') // Remove tags HTML
            .trim();
        }
      });
    }
    next();
  });

  // Middleware para prevenção de ataques de timing
  app.use((req, res, next) => {
    res.setHeader('Timing-Allow-Origin', 'none');
    next();
  });
}; 