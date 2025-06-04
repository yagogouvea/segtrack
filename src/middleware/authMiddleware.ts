import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Configure esta variável de ambiente antes de iniciar o servidor.');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Interface para requisições autenticadas
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    permissions: string[];
    lastTokenRefresh?: number;
  };
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

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const ip = req.ip;
  
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' 
    });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    recordFailedAttempt(ip);
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      permissions: string[];
      iat?: number;
    };
    
    // Verificar idade do token
    if (user.iat && Date.now() - user.iat * 1000 > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ error: 'Token expirado' });
    }

    req.user = user;
    next();
  } catch (error) {
    recordFailedAttempt(ip);
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
        return res.status(403).json({ error: 'Permissão negada' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};
