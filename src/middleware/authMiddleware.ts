import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Configure esta variável de ambiente antes de iniciar o servidor.');
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthUser {
  id: string;
  email: string;
  permissions: string[];
  role?: string;
  lastTokenRefresh?: number;
}

// Interface para requisições autenticadas
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Rate limiting para falhas de autenticação
const failedAuthAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const attempts = failedAuthAttempts.get(ip);

  if (attempts) {
    if (now - attempts.firstAttempt > BLOCK_DURATION) {
      failedAuthAttempts.delete(ip);
      return true;
    }
    return attempts.count < MAX_FAILED_ATTEMPTS;
  }
  return true;
};

const recordFailedAttempt = (ip: string) => {
  const now = Date.now();
  const attempts = failedAuthAttempts.get(ip);

  if (attempts) {
    attempts.count++;
  } else {
    failedAuthAttempts.set(ip, { count: 1, firstAttempt: now });
  }
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET não está definido');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const decoded = jwt.verify(token, secret) as unknown as AuthUser;
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    try {
      const userPermissions = Array.isArray(req.user.permissions) 
        ? req.user.permissions 
        : JSON.parse(req.user.permissions || '[]');

      if (!userPermissions.includes(requiredPermission)) {
        // Se o usuário é admin, permite acesso
        if (req.user.role === 'admin') {
          return next();
        }
        return res.status(403).json({ error: 'Permissão negada' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};
